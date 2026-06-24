-- ============================================================
--  HourHive — Demo Data Cleanup Script
--  Safe to run multiple times (idempotent)
--
--  PRESERVES:
--    • All table structures, indexes, constraints
--    • alembic_version (migration history)
--    • super_admin user account
--
--  REMOVES:
--    • All admin and employee users
--    • All projects and activities
--    • All timesheets, details, approval history
--    • All audit logs, notifications, holidays
--    • All system config entries
--
--  AUTO_INCREMENT: reset to 1 for truncated tables;
--                  set to max(id)+1 for user_master
-- ============================================================

SET NAMES utf8mb4;

-- ── 0. Pre-cleanup row counts ────────────────────────────────────────────────
SELECT '=== PRE-CLEANUP COUNTS ===' AS info;
SELECT 'approval_history'  AS tbl, COUNT(*) AS rows FROM approval_history  UNION ALL
SELECT 'timesheet_detail'  AS tbl, COUNT(*) AS rows FROM timesheet_detail  UNION ALL
SELECT 'timesheet_header'  AS tbl, COUNT(*) AS rows FROM timesheet_header  UNION ALL
SELECT 'audit_log'         AS tbl, COUNT(*) AS rows FROM audit_log         UNION ALL
SELECT 'notification_log'  AS tbl, COUNT(*) AS rows FROM notification_log  UNION ALL
SELECT 'holiday_master'    AS tbl, COUNT(*) AS rows FROM holiday_master    UNION ALL
SELECT 'system_config'     AS tbl, COUNT(*) AS rows FROM system_config     UNION ALL
SELECT 'project_master'    AS tbl, COUNT(*) AS rows FROM project_master    UNION ALL
SELECT 'activity_master'   AS tbl, COUNT(*) AS rows FROM activity_master   UNION ALL
SELECT 'user_master'       AS tbl, COUNT(*) AS rows FROM user_master;

-- ── 1. Disable FK checks — allows any deletion order ────────────────────────
SET @saved_fk = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- ── 2. Transactional data (child tables first, then parents) ─────────────────

-- approval_history: FK → timesheet_header (CASCADE), → user_master (NO ACTION)
TRUNCATE TABLE `approval_history`;

-- timesheet_detail: FK → timesheet_header (CASCADE), → user_master, project_master, activity_master
TRUNCATE TABLE `timesheet_detail`;

-- timesheet_header: FK → user_master (NO ACTION, x3)
TRUNCATE TABLE `timesheet_header`;

-- audit_log: FK → user_master (NO ACTION)
TRUNCATE TABLE `audit_log`;

-- notification_log: FK → user_master (NO ACTION)
TRUNCATE TABLE `notification_log`;

-- ── 3. Reference / master data ───────────────────────────────────────────────

-- holiday_master: no real FK (created_by is plain INT)
TRUNCATE TABLE `holiday_master`;

-- system_config: no FK
TRUNCATE TABLE `system_config`;

-- project_master: FK → user_master (NO ACTION)
TRUNCATE TABLE `project_master`;

-- activity_master: no FK
TRUNCATE TABLE `activity_master`;

-- ── 4. Users — delete demo accounts, keep super_admin ────────────────────────

DELETE FROM `user_master`
WHERE `role` IN ('admin', 'employee');

-- Reset AUTO_INCREMENT to one past the highest remaining id
-- (TRUNCATE resets to 1 automatically; DELETE does not)
SET @next_id = (SELECT COALESCE(MAX(`id`), 0) + 1 FROM `user_master`);
SET @sql = CONCAT('ALTER TABLE `user_master` AUTO_INCREMENT = ', @next_id);
PREPARE _stmt FROM @sql;
EXECUTE _stmt;
DEALLOCATE PREPARE _stmt;

-- ── 5. Re-enable FK checks ───────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = @saved_fk;

-- ── 6. Post-cleanup verification ─────────────────────────────────────────────
SELECT '=== POST-CLEANUP VERIFICATION ===' AS info;

SELECT
    t.TABLE_NAME                                AS `table`,
    COALESCE(t.AUTO_INCREMENT, 'n/a')           AS `next_auto_increment`,
    CASE
        WHEN t.TABLE_NAME = 'alembic_version' THEN 'PRESERVED (migration state)'
        WHEN t.TABLE_NAME = 'user_master'     THEN 'PARTIALLY PRESERVED (super_admin kept)'
        ELSE 'CLEARED'
    END                                         AS `status`
FROM information_schema.TABLES t
WHERE t.TABLE_SCHEMA = DATABASE()
ORDER BY t.TABLE_NAME;

-- Confirm alembic version is untouched
SELECT '--- Alembic migration version (must be intact) ---' AS info;
SELECT version_num FROM alembic_version;

-- Confirm super_admin is intact
SELECT '--- Preserved accounts ---' AS info;
SELECT id, employee_code, full_name, email, role, status
FROM user_master
WHERE role = 'super_admin';

SELECT '=== CLEANUP COMPLETE ===' AS info;
