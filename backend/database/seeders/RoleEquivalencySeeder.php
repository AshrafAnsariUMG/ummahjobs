<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleEquivalencySeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('role_equivalencies')->count() > 0) {
            $this->command->info('Already seeded. Skipping.');
            return;
        }

        $groups = [
            ['group_name' => 'software_engineer',
             'terms' => json_encode(['software engineer','software developer','developer','programmer','coder','software architect','engineer'])],
            ['group_name' => 'frontend_developer',
             'terms' => json_encode(['frontend developer','frontend engineer','ui developer','react developer','vue developer','angular developer','javascript developer','web developer','ui engineer','front end developer','front-end developer'])],
            ['group_name' => 'backend_developer',
             'terms' => json_encode(['backend developer','backend engineer','server-side developer','api developer','php developer','python developer','java developer','node developer','laravel developer','django developer','back end developer','back-end developer'])],
            ['group_name' => 'fullstack_developer',
             'terms' => json_encode(['full stack developer','fullstack developer','full-stack developer','full stack engineer','fullstack engineer','full-stack engineer'])],
            ['group_name' => 'mobile_developer',
             'terms' => json_encode(['mobile developer','ios developer','android developer','react native developer','flutter developer','app developer','mobile engineer'])],
            ['group_name' => 'devops_engineer',
             'terms' => json_encode(['devops engineer','sre','site reliability engineer','platform engineer','infrastructure engineer','cloud engineer','devops','systems engineer','operations engineer'])],
            ['group_name' => 'data_scientist',
             'terms' => json_encode(['data scientist','ml engineer','machine learning engineer','ai engineer','data engineer','data analyst','business intelligence analyst','bi analyst','analytics engineer'])],
            ['group_name' => 'product_manager',
             'terms' => json_encode(['product manager','pm','product owner','po','product lead','head of product','senior product manager','associate pm'])],
            ['group_name' => 'project_manager',
             'terms' => json_encode(['project manager','programme manager','program manager','delivery manager','scrum master','agile coach','it project manager','technical pm'])],
            ['group_name' => 'ux_designer',
             'terms' => json_encode(['ux designer','ui designer','ui/ux designer','product designer','interaction designer','visual designer','web designer','graphic designer','digital designer','creative designer','ux researcher'])],
            ['group_name' => 'marketing_manager',
             'terms' => json_encode(['marketing manager','digital marketing manager','marketing lead','head of marketing','marketing director','growth manager','brand manager','marketing specialist','marketing executive','content manager'])],
            ['group_name' => 'seo_specialist',
             'terms' => json_encode(['seo specialist','seo manager','seo analyst','search engine optimisation','sem specialist','digital marketing specialist','ppc specialist','paid media manager','performance marketer'])],
            ['group_name' => 'content_writer',
             'terms' => json_encode(['content writer','copywriter','content creator','content strategist','technical writer','blog writer','social media manager','communications manager','editor'])],
            ['group_name' => 'sales_manager',
             'terms' => json_encode(['sales manager','account executive','ae','business development manager','bdm','sales director','head of sales','sales representative','sales executive','account manager','business development'])],
            ['group_name' => 'hr_manager',
             'terms' => json_encode(['hr manager','human resources manager','people manager','talent acquisition manager','recruiter','hr business partner','hrbp','hr director','head of people','hr generalist','people operations'])],
            ['group_name' => 'accountant',
             'terms' => json_encode(['accountant','financial analyst','finance manager','cfo','financial controller','bookkeeper','accounts manager','finance director','management accountant','tax accountant','auditor','chartered accountant','cpa'])],
            ['group_name' => 'customer_support',
             'terms' => json_encode(['customer support','customer service','customer success','client relations','support specialist','help desk','customer care','service desk','customer experience','cx specialist'])],
            ['group_name' => 'operations_manager',
             'terms' => json_encode(['operations manager','ops manager','head of operations','coo','business operations manager','general manager','office manager','operations director','operations lead'])],
            ['group_name' => 'teacher',
             'terms' => json_encode(['teacher','instructor','educator','tutor','lecturer','professor','trainer','coach','academic','faculty','teaching assistant'])],
            ['group_name' => 'imam',
             'terms' => json_encode(['imam','sheikh','scholar','islamic teacher','quran teacher','religious leader','muslim chaplain','chaplain','dawah worker','islamic studies teacher','ustadh','ustaz'])],
            ['group_name' => 'nurse',
             'terms' => json_encode(['nurse','registered nurse','rn','staff nurse','clinical nurse','senior nurse','nurse practitioner','healthcare worker','nursing assistant','care assistant'])],
            ['group_name' => 'doctor',
             'terms' => json_encode(['doctor','physician','medical doctor','md','gp','general practitioner','specialist','consultant','medical officer','clinician'])],
            ['group_name' => 'pharmacist',
             'terms' => json_encode(['pharmacist','pharmacy manager','clinical pharmacist','dispensing pharmacist','pharmacy technician'])],
            ['group_name' => 'social_worker',
             'terms' => json_encode(['social worker','case manager','care manager','support worker','community worker','welfare officer','youth worker','family support worker'])],
            ['group_name' => 'lawyer',
             'terms' => json_encode(['lawyer','attorney','solicitor','barrister','legal counsel','legal advisor','paralegal','compliance officer','legal associate'])],
            ['group_name' => 'architect',
             'terms' => json_encode(['architect','senior architect','solutions architect','enterprise architect','technical architect','system architect','it architect','cloud architect'])],
            ['group_name' => 'qa_engineer',
             'terms' => json_encode(['qa engineer','quality assurance engineer','test engineer','software tester','qa analyst','quality analyst','automation engineer','sdet'])],
            ['group_name' => 'cybersecurity',
             'terms' => json_encode(['security engineer','cybersecurity engineer','information security','infosec','security analyst','penetration tester','ethical hacker','soc analyst','security architect'])],
            ['group_name' => 'data_entry',
             'terms' => json_encode(['data entry','data entry operator','data processor','administrative assistant','office assistant','clerk','admin assistant'])],
            ['group_name' => 'fundraiser',
             'terms' => json_encode(['fundraiser','fundraising manager','development officer','grants manager','donor relations','philanthropy manager','fundraising executive'])],
        ];

        foreach ($groups as &$g) {
            $g['created_at'] = now();
            $g['updated_at'] = now();
        }

        DB::table('role_equivalencies')->insert($groups);

        $this->command->info('Seeded ' . count($groups) . ' role equivalency groups.');
    }
}
