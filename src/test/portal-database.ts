import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
export const testUser='11111111-1111-4111-8111-111111111111';
export async function portalDatabase(){
  const db=new PGlite();
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
    CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('app.user_id',true),'')::uuid $$;
    CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text,metadata jsonb);
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array(name,'/') $$;
    CREATE FUNCTION storage.filename(name text) RETURNS text LANGUAGE sql AS $$ SELECT (string_to_array(name,'/'))[array_length(string_to_array(name,'/'),1)] $$;
    CREATE FUNCTION storage.extension(name text) RETURNS text LANGUAGE sql AS $$ SELECT (string_to_array(name,'.'))[array_length(string_to_array(name,'.'),1)] $$;
    SELECT set_config('app.user_id','${testUser}',false);`);
  for(const file of readdirSync('drizzle/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(readFileSync(`drizzle/migrations/${file}`,'utf8'));
  await db.query(`INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,'{"full_name":"Original Name","national_id":"12345678901234","phone":"01012345678"}')`,[testUser]);
  return db;
}