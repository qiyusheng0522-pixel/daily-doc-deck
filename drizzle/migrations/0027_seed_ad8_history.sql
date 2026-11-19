with items(n, t) as (values (1,'判断力出现问题（如做决定困难、财务决定错误）'),(2,'对活动和嗜好的兴趣降低'),(3,'重复相同的问题、故事或陈述'),(4,'学习使用工具、电器或小器具有困难'),(5,'忘记正确的月份或年份'),(6,'处理复杂的财务问题有困难'),(7,'记不住约会时间'),(8,'每天都有思考和记忆方面的问题')),
ord(n, rk) as (values (3,1),(8,2),(1,3),(5,4),(7,5),(2,6),(6,7),(4,8)),
src as (select p.id, v.k, greatest(0, p.ad8 - v.k) tot, now() - interval '1 day' - (v.k * interval '90 days') - (abs(hashtext(p.id::text)) % 5) * interval '1 day' ts
        from public.patients p cross join (values (0),(1),(2)) v(k) where p.ad8 is not null)
insert into public.scale_assessments (patient_id, scale, items, total, assessed_by, created_at)
select s.id, 'ad8', (select jsonb_object_agg(i.t, case when o.rk <= s.tot then 1 else 0 end) from items i join ord o using (n)), s.tot,
  case when s.k = 0 then '小市社区 · 张护士' else '小市社区 · 王护士' end, s.ts from src s;