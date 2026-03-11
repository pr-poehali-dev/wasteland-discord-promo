"""
Управление промокодами Wasteland.
GET /  — список промокодов (требует admin_password)
POST / — создать промокод (требует admin_password)
DELETE / — удалить промокод (требует admin_password)
POST /activate — активировать промокод (публичный)
"""

import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def schema():
    return os.environ['MAIN_DB_SCHEMA']

def check_admin(body: dict) -> bool:
    return body.get('admin_password') == os.environ.get('ADMIN_PASSWORD', '')

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    # POST /activate — активация промокода (публичный)
    if method == 'POST' and path.endswith('/activate'):
        code = body.get('code', '').strip().upper()
        if not code:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Промокод не указан'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, role_name, discord_invite, max_uses, used_count, is_active, expires_at FROM {schema()}.promocodes WHERE code = %s",
            (code,)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Промокод не найден'})}

        pid, role_name, discord_invite, max_uses, used_count, is_active, expires_at = row

        if not is_active:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Промокод деактивирован'})}

        if max_uses is not None and used_count >= max_uses:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Промокод уже использован'})}

        if expires_at:
            from datetime import datetime, timezone
            if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
                conn.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Срок действия промокода истёк'})}

        cur.execute(
            f"UPDATE {schema()}.promocodes SET used_count = used_count + 1 WHERE id = %s",
            (pid,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'success': True,
            'role_name': role_name,
            'discord_invite': discord_invite,
        })}

    # GET / — список промокодов (только админ)
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        if params.get('admin_password') != os.environ.get('ADMIN_PASSWORD', ''):
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, code, role_name, discord_invite, max_uses, used_count, is_active, created_at, expires_at FROM {schema()}.promocodes ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        conn.close()
        result = [
            {
                'id': r[0], 'code': r[1], 'role_name': r[2], 'discord_invite': r[3],
                'max_uses': r[4], 'used_count': r[5], 'is_active': r[6],
                'created_at': r[7].isoformat() if r[7] else None,
                'expires_at': r[8].isoformat() if r[8] else None,
            }
            for r in rows
        ]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

    # POST / — создать промокод (только админ)
    if method == 'POST':
        if not check_admin(body):
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

        code = body.get('code', '').strip().upper()
        role_name = body.get('role_name', '').strip()
        discord_invite = body.get('discord_invite', '').strip()
        max_uses = body.get('max_uses', 1)
        expires_at = body.get('expires_at') or None

        if not code or not role_name:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажи код и роль'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema()}.promocodes (code, role_name, discord_invite, max_uses, expires_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (code, role_name, discord_invite or None, max_uses, expires_at)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True, 'id': new_id})}

    # DELETE / — удалить промокод (только админ)
    if method == 'DELETE':
        if not check_admin(body):
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

        pid = body.get('id')
        if not pid:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажи id'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {schema()}.promocodes WHERE id = %s", (pid,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True})}

    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
