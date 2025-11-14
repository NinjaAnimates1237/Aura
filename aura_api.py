from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def db():
    return sqlite3.connect("aura.db", check_same_thread=False)

# --- SETUP TABLES ---
con = db()
cur = con.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT, bio TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, sender TEXT, receiver TEXT, msg TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS servers(id INTEGER PRIMARY KEY, name TEXT)")
con.commit()

# --- CREATE ACCOUNT ---
@app.post("/create")
def create():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute("INSERT INTO users(username, bio) VALUES(?, ?)", (data["username"], ""))
    con.commit()
    return {"ok": True}

# --- SEND DM ---
@app.post("/dm")
def dm():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute("INSERT INTO messages(sender, receiver, msg) VALUES(?,?,?)",
                (data["sender"], data["receiver"], data["msg"]))
    con.commit()
    return {"ok": True}

# --- GET DM ---
@app.get("/dm/<user>/<other>")
def get_dm(user, other):
    con = db()
    cur = con.cursor()
    cur.execute("""
        SELECT sender, msg FROM messages
        WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)
    """, (user, other, other, user))
    return jsonify(cur.fetchall())

app.run(port=5000)
