const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://airupantar01_db_user:AdEaC24Ucafwq3ha@cluster0.bdpcfjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const SUBJECT_DEFINITIONS = [
  {
    name: 'পদার্থবিজ্ঞান ১ম পত্র',
    regex: /ভেক্টর|vector|(?<!তাপ)গতিবিদ্যা|dynamics|বলবিদ্যা|মেকানিক্স|mechanics|মহাকর্ষ|gravity|gravitation|পর্যাবৃত্ত গতি|periodic motion|তরঙ্গ|waves|আদর্শ গ্যাস|ideal gas|ভৌত জগৎ/gi
  },
  {
    name: 'পদার্থবিজ্ঞান ২য় পত্র',
    regex: /তাপগতিবিদ্যা|thermodynamics|স্থির তড়িৎ|স্থির তড়িৎ|electrostatics|চল তড়িৎ|চল তড়িৎ|current electricity|ভৌত আলোকবিজ্ঞান|জ্যামিতিক আলোকবিজ্ঞান|আধুনিক পদার্থবিজ্ঞান|পরমাণু মডেল|সেমিকন্ডাক্টর/gi
  },
  {
    name: 'রসায়ন ১ম পত্র',
    regex: /গুণগত রসায়ন|গুণগত রসায়ন|গুনগত রসায়ন|গুনগত রসায়ন|qualitative chem|মৌলের পর্যাবৃত্ত|মৌলের পর্যায়বৃত্ত|পর্যাবৃত্তিক ধর্ম|periodic properties|রাসায়নিক পরিবর্তন|রাসায়নিক পরিবর্তন|chemical change|কর্মমুখী রসায়ন|কর্মমুখী রসায়ন/gi
  },
  {
    name: 'রসায়ন ২য় পত্র',
    regex: /পরিবেশ রসায়ন|পরিবেশ রসায়ন|environmental chem|জৈব যৌগ|জৈব রসায়ন|জৈব রসায়ন|organic chem|পরিমাণগত রসায়ন|পরিমাণগত রসায়ন|quantitative chem|তড়িৎ রসায়ন|তড়িৎ রসায়ন|electrochemistry|অর্থনৈতিক রসায়ন/gi
  },
  {
    name: 'উচ্চতর গণিত ১ম পত্র',
    regex: /ম্যাট্রিক্স|নির্ণায়ক|নির্ণায়ক|matrix|matrices|determinant|সরলরেখা|straight line|বৃত্ত|circle|বিন্যাস|সমাবেশ|ত্রিকোণমিতিক অনুপাত|সংযুক্ত কোণ|সংযুক্ত কোন|trigonometry|ফাংশন|অন্তরীকরণ|differentiation|যোগজীকরণ|integration|ক্যালকুলাস|calculus|যোগাশ্রয়ী|যোগাশ্রয়ী/gi
  },
  {
    name: 'উচ্চতর গণিত ২য় পত্র',
    regex: /জটিল সংখ্যা|complex number|বহুপদী|polynomial|দ্বিপদী|binomial|কণিক|কনিক|conic|বিপরীত ত্রিকোণমিতিক|বিপরীত ত্রিকোনমিতিক|স্থিতিবিদ্যা|statics|সমতলে বস্তুকণা|বিস্তার পরিমাপ/gi
  },
  {
    name: 'উদ্ভিদবিজ্ঞান (জীববিজ্ঞান ১ম পত্র)',
    regex: /কোষ ও এর গঠন|কোষ বিভাজন|অনুজীব|নগ্নবীজী|আবৃতবীজী|ব্রায়োফাইটা|টেরেডোফাইটা|উদ্ভিদ প্রজনন|উদ্ভিদ শারীরতত্ত্ব|জীবপ্রযুক্তি|টিস্যু ও টিস্যুতন্ত্র/gi
  },
  {
    name: 'প্রাণিবিজ্ঞান (জীববিজ্ঞান ২য় পত্র)',
    regex: /প্রাণীর বিভিন্নতা|প্রাণির পরিচিতি|পরিপাক ও শোষণ|রক্ত ও সংবহন|শ্বসন ও শ্বাসক্রিয়া|চলন ও অঙ্গচালনা|মানব শারীরতত্ত্ব|জিনতত্ত্ব|শ্রেণিবিন্যাস|শ্রেণীবিন্যাস/gi
  },
  {
    name: 'বাংলা',
    regex: /বাংলা|bangla|সোনার তরী|অপরিচিতা|লালসালু|সিরাজ|বিলাসী|বিদ্রোহী|তাহারেই পড়ে মনে|আমার পথ|মানব কল্যাণ|যৌবনের গান|ধ্বনি|বর্ণ|শব্দ|অভিধান|ব্যাকরণ|নির্মিতি/gi
  },
  {
    name: 'English',
    regex: /english|pronoun|noun|adjective|adverb|determiners|sentence|written English|grammar|preposition|passage/gi
  },
  {
    name: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    regex: /ict|তথ্য ও যোগাযোগ|সংখ্যা পদ্ধতি|html|সি প্রোগ্রামিং|নেটওয়ার্ক/gi
  }
];

function isGenericSubjectTitle(raw) {
  if (!raw || !raw.trim()) return true;
  const clean = raw.trim();
  return /^(?:বিষয়|বিষয়|subject)\s*[\d০-৯]*$/i.test(clean);
}

function inferSubjectTitleFromContent(contentText, fallbackTitle) {
  let best = null;
  let maxScore = 0;
  for (const def of SUBJECT_DEFINITIONS) {
    const matches = contentText.match(def.regex);
    const score = matches ? matches.length : 0;
    if (score > maxScore) {
      maxScore = score;
      best = def.name;
    }
  }
  return best && maxScore > 0 ? best : fallbackTitle;
}

function healCourseObj(c) {
  if (!c || typeof c !== 'object') return c;
  const course = { ...c };

  if (Array.isArray(course.sections) && course.sections.length > 0) {
    const modulesBySection = {};
    (course.modules || []).forEach(m => {
      const sId = m.parentSectionId || 'default';
      if (!modulesBySection[sId]) modulesBySection[sId] = [];
      modulesBySection[sId].push(m);
    });

    course.sections = course.sections.map((sec, sIdx) => {
      if (sec.type === 'archive' && !sec.parentArchiveId) return sec;

      const mods = modulesBySection[sec.id] || [];
      const contentText = mods.map(m => {
        const mTitle = m.title || '';
        const lTitles = (m.lectures || []).map(l => (l.title || '') + ' ' + (l.description || '')).join(' ');
        return mTitle + ' ' + lTitles;
      }).join(' ');

      let newTitle = sec.title;
      if (isGenericSubjectTitle(sec.title) || !sec.title) {
        newTitle = inferSubjectTitleFromContent(contentText, sec.title || `বিষয় ${sIdx + 1}`);
      }

      return {
        ...sec,
        title: newTitle
      };
    });

    const updatedSecTitleMap = {};
    course.sections.forEach(s => {
      updatedSecTitleMap[s.id] = s.title;
    });

    if (Array.isArray(course.modules)) {
      course.modules = course.modules.map(mod => {
        const updatedSecTitle = mod.parentSectionId ? updatedSecTitleMap[mod.parentSectionId] : null;
        return {
          ...mod,
          parentSectionTitle: updatedSecTitle || mod.parentSectionTitle
        };
      });
    }
  }

  return course;
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('adommo_edtech');
  const coursesCol = db.collection('courses');

  // We read from local data/courses.json to make sure all courses are captured
  const localList = JSON.parse(fs.readFileSync('data/courses.json', 'utf8'));
  console.log(`Found ${localList.length} courses in local courses.json.`);

  const healedCourses = [];

  for (const c of localList) {
    console.log(`\nProcessing course: ${c.id} - ${c.title}...`);
    const healed = healCourseObj(c);
    const { _id, ...cleanData } = healed;

    if (cleanData.sections) {
      console.log('Final sections:');
      cleanData.sections.forEach(s => console.log(`  - [${s.id}] ${s.title}`));
    }

    await coursesCol.replaceOne({ id: cleanData.id }, cleanData, { upsert: true });
    healedCourses.push(cleanData);
    console.log(`Updated course ${cleanData.id} in Atlas.`);
  }

  fs.writeFileSync('data/courses.json', JSON.stringify(healedCourses, null, 2), 'utf8');
  console.log('\nSuccessfully saved healed courses to data/courses.json!');

  await client.close();
  console.log('Migration finished successfully!');
}

run().catch(console.error);
