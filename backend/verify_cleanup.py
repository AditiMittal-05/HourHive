import pymysql
c = pymysql.connect(host="localhost", user="root", password="root",
                    db="hourhive", charset="utf8mb4", autocommit=True)
cur = c.cursor()

tables = ["user_master","project_master","activity_master","timesheet_header",
          "timesheet_detail","audit_log","notification_log","holiday_master","approval_history"]

print(f"{'Table':<30} {'Rows':>8}  {'AUTO_INCREMENT':>14}")
print("-" * 58)
for tbl in tables:
    cur.execute("SELECT COUNT(*) FROM " + tbl)
    cnt = cur.fetchone()[0]
    cur.execute("SHOW TABLE STATUS LIKE %s", (tbl,))
    row = cur.fetchone()
    ai = row[10]   # AUTO_INCREMENT column index
    print(f"  {tbl:<28} {cnt:>8}  {str(ai):>14}")

print()
cur.execute("SELECT id, employee_code, email, role FROM user_master WHERE role = %s", ("super_admin",))
row = cur.fetchone()
print(f"super_admin: id={row[0]}, code={row[1]}, email={row[2]}")
cur.execute("SELECT version_num FROM alembic_version")
print(f"alembic_version: {cur.fetchone()[0]}")
c.close()
