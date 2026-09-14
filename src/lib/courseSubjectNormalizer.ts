/**
 * ADOMMO (অদম্য) — Universal Course & Subject Normalizer
 * 
 * এটি যেকোনো কোর্স ডেটা (Scraper JSON, Telegram JSON, MongoDB, API) থেকে:
 * ১. জেনেরিক বিষয় নাম ("বিষয় ১", "বিষয় ২", "Subject 1" ইত্যাদি) স্বয়ংক্রিয়ভাবে আসল একাডেমিক বিষয়ে রূপান্তর করে
 * ২. চ্যাপ্টার ও ক্লাসের নাম থেকে বিষয় নিখুঁতভাবে শনাক্ত করে (পদার্থবিজ্ঞান ১ম/২য় পত্র, রসায়ন ১ম/২য় পত্র, উচ্চতর গণিত ১ম/২য় পত্র, ইত্যাদি)
 * ৩. জেনেরিক চ্যাপ্টার নাম ("Chapter 1: অধ্যায় 1" ইত্যাদি) লেকচারের আসল বিষয়বস্তু দিয়ে রিনেম করে
 */

export const CHAPTER_SYNONYMS: Record<string, string> = {
  'ভেক্টর': 'ভেক্টর',
  'vector': 'ভেক্টর',
  'vectors': 'ভেক্টর',
  'গতিবিদ্যা': 'গতিবিদ্যা',
  'dynamics': 'গতিবিদ্যা',
  'নিউটনীয় বলবিদ্যা': 'নিউটনীয় বলবিদ্যা',
  'নিউটনিয়ান মেকানিক্স': 'নিউটনীয় বলবিদ্যা',
  'নিউটনিয়ান মেকানিক্স': 'নিউটনীয় বলবিদ্যা',
  'নিউটনিয়ান বলবিদ্যা': 'নিউটনীয় বলবিদ্যা',
  'newtonian mechanics': 'নিউটনীয় বলবিদ্যা',
  'কাজ শক্তি ও ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা',
  'কাজ, শক্তি ও ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা',
  'কাজ ক্ষমতা শক্তি': 'কাজ, শক্তি ও ক্ষমতা',
  'work power energy': 'কাজ, শক্তি ও ক্ষমতা',
  'মহাকর্ষ ও অভিকর্ষ': 'মহাকর্ষ ও অভিকর্ষ',
  'মহাকর্ষ': 'মহাকর্ষ ও অভিকর্ষ',
  'gravitation': 'মহাকর্ষ ও অভিকর্ষ',
  'gravity': 'মহাকর্ষ ও অভিকর্ষ',
  'পদার্থের গাঠনিক ধর্ম': 'পদার্থের গাঠনিক ধর্ম',
  'পর্যাবৃত্ত গতি': 'পর্যাবৃত্ত গতি',
  'পর্যাবৃত্ত': 'পর্যাবৃত্ত গতি',
  'periodic motion': 'পর্যাবৃত্ত গতি',
  'তরঙ্গ': 'তরঙ্গ',
  'waves': 'তরঙ্গ',
  'আদর্শ গ্যাস ও গতিতত্ত্ব': 'আদর্শ গ্যাস ও গতিতত্ত্ব',
  'আদর্শ গ্যাস': 'আদর্শ গ্যাস ও গতিতত্ত্ব',
  'ideal gas': 'আদর্শ গ্যাস ও গতিতত্ত্ব',
  'তাপগতিবিদ্যা': 'তাপগতিবিদ্যা',
  'thermodynamics': 'তাপগতিবিদ্যা',
  'স্থির তড়িৎ': 'স্থির তড়িৎ',
  'স্থির তড়িৎ': 'স্থির তড়িৎ',
  'electrostatics': 'স্থির তড়িৎ',
  'চল তড়িৎ': 'চল তড়িৎ',
  'চল তড়িৎ': 'চল তড়িৎ',
  'চলতড়িৎ': 'চল তড়িৎ',
  'current electricity': 'চল তড়িৎ',
  'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব': 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব',
  'ভৌত আলোকবিজ্ঞান': 'ভৌত আলোকবিজ্ঞান',
  'জ্যামিতিক আলোকবিজ্ঞান': 'জ্যামিতিক আলোকবিজ্ঞান',
  'আধুনিক পদার্থবিজ্ঞানের সূচনা': 'আধুনিক পদার্থবিজ্ঞানের সূচনা',
  'পরমাণু মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান': 'পরমাণু মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান',
  'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স': 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স',
  'গুণগত রসায়ন': 'গুণগত রসায়ন',
  'গুনগত রসায়ন': 'গুণগত রসায়ন',
  'গুনগত রসায়ন': 'গুণগত রসায়ন',
  'qualitative chemistry': 'গুণগত রসায়ন',
  'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন': 'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
  'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন': 'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
  'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন': 'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
  'রাসায়নিক পরিবর্তন': 'রাসায়নিক পরিবর্তন',
  'রাসায়নিক পরিবর্তন': 'রাসায়নিক পরিবর্তন',
  'chemical change': 'রাসায়নিক পরিবর্তন',
  'কর্মমুখী রসায়ন': 'কর্মমুখী রসায়ন',
  'কর্মমুখী রসায়ন': 'কর্মমুখী রসায়ন',
  'পরিবেশ রসায়ন': 'পরিবেশ রসায়ন',
  'পরিবেশ রসায়ন': 'পরিবেশ রসায়ন',
  'জৈব যৌগ': 'জৈব যৌগ',
  'জৈব রসায়ন': 'জৈব যৌগ',
  'জৈব রসায়ন': 'জৈব যৌগ',
  'organic chemistry': 'জৈব যৌগ',
  'পরিমাণগত রসায়ন': 'পরিমাণগত রসায়ন',
  'পরিমাণগত রসায়ন': 'পরিমাণগত রসায়ন',
  'quantitative chemistry': 'পরিমাণগত রসায়ন',
  'তড়িৎ রসায়ন': 'তড়িৎ রসায়ন',
  'তড়িৎ রসায়ন': 'তড়িৎ রসায়ন',
  'অর্থনৈতিক রসায়ন': 'অর্থনৈতিক রসায়ন',
  'ম্যাট্রিক্স ও নির্ণায়ক': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'ম্যাট্রিক্স ও নির্ণায়ক': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'matrix': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'matrices': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'determinant': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'determinants': 'ম্যাট্রিক্স ও নির্ণায়ক',
  'সরলরেখা': 'সরলরেখা',
  'straight line': 'সরলরেখা',
  'বৃত্ত': 'বৃত্ত',
  'circle': 'বৃত্ত',
  'বিন্যাস ও সমাবেশ': 'বিন্যাস ও সমাবেশ',
  'ত্রিকোণমিতিক অনুপাত': 'ত্রিকোণমিতিক অনুপাত',
  'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত': 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত',
  'সংযুক্ত কোনের ত্রিকোনমিতিক অনুপাত': 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত',
  'trigonometry': 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত',
  'ফাংশন ও ফাংশনের লেখচিত্র': 'ফাংশন ও ফাংশনের লেখচিত্র',
  'অন্তরীকরণ': 'অন্তরীকরণ',
  'differentiation': 'অন্তরীকরণ',
  'যোগজীকরণ': 'যোগজীকরণ',
  'integration': 'যোগজীকরণ',
  'calculus': 'ক্যালকুলাস',
  'যোগাশ্রয়ী প্রোগ্রাম': 'যোগাশ্রয়ী প্রোগ্রাম',
  'যোগাশ্রয়ী প্রোগ্রাম': 'যোগাশ্রয়ী প্রোগ্রাম',
  'কণিক': 'কণিক',
  'কনিক': 'কণিক',
  'conic': 'কণিক',
  'conics': 'কণিক',
  'জটিল সংখ্যা': 'জটিল সংখ্যা',
  'complex number': 'জটিল সংখ্যা',
  'complex numbers': 'জটিল সংখ্যা',
  'বহুপদী ও বহুপদী সমীকরণ': 'বহুপদী ও বহুপদী সমীকরণ',
  'বহুপদী': 'বহুপদী ও বহুপদী সমীকরণ',
  'polynomial': 'বহুপদী ও বহুপদী সমীকরণ',
  'polynomials': 'বহুপদী ও বহুপদী সমীকরণ',
  'দ্বিপদী বিস্তৃতি': 'দ্বিপদী বিস্তৃতি',
  'দ্বিপদী': 'দ্বিপদী বিস্তৃতি',
  'binomial expansion': 'দ্বিপদী বিস্তৃতি',
  'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ': 'বিপরীত ত্রিকোণমিতিক ফাংশন',
  'বিপরীত ত্রিকোণমিতিক ফাংশন': 'বিপরীত ত্রিকোণমিতিক ফাংশন',
  'বিপরীত ত্রিকোনমিতিক ফাংশন': 'বিপরীত ত্রিকোণমিতিক ফাংশন',
  'স্থিতিবিদ্যা': 'স্থিতিবিদ্যা',
  'statics': 'স্থিতিবিদ্যা',
  'সমতলে বস্তুকণার গতি': 'সমতলে বস্তুকণার গতি',
  'বিস্তার পরিমাপ ও সম্ভাবনা': 'বিস্তার পরিমাপ ও সম্ভাবনা',
  'কোষ ও এর গঠন': 'কোষ ও এর গঠন',
  'কোষ বিভাজন': 'কোষ বিভাজন',
  'অনুজীব': 'অনুজীব',
  'নগ্নবীজী ও আবৃতবীজী': 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ',
  'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ': 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ',
  'ব্রায়োফাইটা ও টেরেডোফাইটা': 'ব্রায়োফাইটা ও টেরেডোফাইটা',
  'উদ্ভিদ প্রজনন': 'উদ্ভিদ প্রজনন',
  'জীবপ্রযুক্তি': 'জীবপ্রযুক্তি',
  'উদ্ভিদ শারীরতত্ত্ব': 'উদ্ভিদ শারীরতত্ত্ব',
  'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস': 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
  'প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস': 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
  'প্রাণির পরিচিতি': 'প্রাণির পরিচিতি',
  'পরিপাক ও শোষণ': 'পরিপাক ও শোষণ',
  'রক্ত ও সংবহন': 'রক্ত ও সংবহন',
  'চলন ও অঙ্গচালনা': 'চলন ও অঙ্গচালনা'
};

export const ACADEMIC_CHAPTER_PATTERNS: { name: string; regex: RegExp }[] = [
  // উচ্চতর গণিত ১ম ও ২য় পত্র
  { name: 'ম্যাট্রিক্স ও নির্ণায়ক', regex: /ম্যাট্রিক্স|নির্ণায়ক|নির্ণায়ক|matrix|matrices|determinant/i },
  { name: 'সরলরেখা', regex: /সরলরেখা|straight\s*line/i },
  { name: 'বৃত্ত', regex: /বৃত্ত|circle/i },
  { name: 'বিন্যাস ও সমাবেশ', regex: /বিন্যাস|সমাবেশ|permutation|combination/i },
  { name: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', regex: /ত্রিকোণমিতি|ত্রিকোনমিতি|সংযুক্ত\s*কোণ|সংযুক্ত\s*কোন|trigonometry/i },
  { name: 'ফাংশন ও ফাংশনের লেখচিত্র', regex: /ফাংশন|লেখচিত্র|function/i },
  { name: 'অন্তরীকরণ', regex: /অন্তরীকরণ|অন্তরিকরন|differentiation|derivative/i },
  { name: 'যোগজীকরণ', regex: /যোগজীকরণ|যোগজিকরন|integration|integral|ক্যালকুলাস|calculus/i },
  { name: 'যোগাশ্রয়ী প্রোগ্রাম', regex: /যোগাশ্রয়ী|যোগাশ্রয়ী|linear\s*programming/i },
  { name: 'কণিক', regex: /কণিক|কনিক|পরাবৃত্ত|উপবৃত্ত|অধিবৃত্ত|conic/i },
  { name: 'জটিল সংখ্যা', regex: /জটিল\s*সংখ্যা|complex\s*number/i },
  { name: 'বহুপদী ও বহুপদী সমীকরণ', regex: /বহুপদী|polynomial/i },
  { name: 'দ্বিপদী বিস্তৃতি', regex: /দ্বিপদী|binomial/i },
  { name: 'বিপরীত ত্রিকোণমিতিক ফাংশন', regex: /বিপরীত\s*ত্রিকোণমিতিক|inverse\s*trig/i },
  { name: 'স্থিতিবিদ্যা', regex: /স্থিতিবিদ্যা|statics/i },
  { name: 'সমতলে বস্তুকণার গতি', regex: /সমতলে\s*বস্তুকণা|বস্তুকণার\s*গতি|প্রাস|projectile/i },
  { name: 'বিস্তার পরিমাপ ও সম্ভাবনা', regex: /বিস্তার\s*পরিমাপ|সম্ভাবনা|probability/i },

  // পদার্থবিজ্ঞান ১ম ও ২য় পত্র
  { name: 'ভৌতজগৎ ও পরিমাপ', regex: /ভৌত\s*জগৎ|ভৌতজগৎ|পরিমাপ|physical\s*world/i },
  { name: 'ভেক্টর', regex: /ভেক্টর|vector/i },
  { name: 'গতিবিদ্যা', regex: /(?<!তাপ)গতিবিদ্যা|dynamics|motion/i },
  { name: 'নিউটনীয় বলবিদ্যা', regex: /নিউটনীয়|নিউটনিয়ান|বলবিদ্যা|newtonian|mechanics/i },
  { name: 'কাজ, শক্তি ও ক্ষমতা', regex: /কাজ.*শক্তি|শক্তি.*কাজ|কাজ.*ক্ষমতা|work\s*power|power.*energy/i },
  { name: 'মহাকর্ষ ও অভিকর্ষ', regex: /মহাকর্ষ|অভিকর্ষ|gravit/i },
  { name: 'পদার্থের গাঠনিক ধর্ম', regex: /পদার্থের\s*গাঠনিক|গাঠনিক\s*ধর্ম|elasticity|surface\s*tension/i },
  { name: 'পর্যাবৃত্ত গতি', regex: /পর্যাবৃত্ত|periodic\s*motion/i },
  { name: 'তরঙ্গ', regex: /তরঙ্গ|waves|শব্দ\s*তরঙ্গ/i },
  { name: 'আদর্শ গ্যাস ও গতিতত্ত্ব', regex: /আদর্শ\s*গ্যাস|গতিতত্ত্ব|ideal\s*gas/i },
  { name: 'তাপগতিবিদ্যা', regex: /তাপগতিবিদ্যা|thermodynamics/i },
  { name: 'স্থির তড়িৎ', regex: /স্থির\s*তড়িৎ|স্থির\s*তড়িৎ|electrostatic/i },
  { name: 'চল তড়িৎ', regex: /চল\s*তড়িৎ|চল\s*তড়িৎ|current\s*electric/i },
  { name: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', regex: /চৌম্বক\s*ক্রিয়া|চুম্বকত্ব|magnet/i },
  { name: 'তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', regex: /তাড়িতচৌম্বকীয়|আবেশ|পরিবর্তী\s*প্রবাহ|ac\s*current/i },
  { name: 'জ্যামিতিক আলোকবিজ্ঞান', regex: /জ্যামিতিক\s*আলোক|geometric\s*optics/i },
  { name: 'ভৌত আলোকবিজ্ঞান', regex: /ভৌত\s*আলোক|wave\s*optics/i },
  { name: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', regex: /আধুনিক\s*পদার্থ|আপেক্ষিকতা|relativity/i },
  { name: 'পরমাণু মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', regex: /পরমাণু\s*মডেল|নিউক্লিয়ার|nuclear|bohr\s*model/i },
  { name: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', regex: /সেমিকন্ডাক্টর|ইলেকট্রনিক্স|semiconductor|transistor/i },

  // রসায়ন ১ম ও ২য় পত্র
  { name: 'ল্যাবরেটরির নিরাপদ ব্যবহার', regex: /ল্যাবরেটরি|নিরাপদ\s*ব্যবহার|laboratory/i },
  { name: 'গুণগত রসায়ন', regex: /গুণগত|গুনগত|qualitative\s*chem/i },
  { name: 'মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন', regex: /মৌলের\s*পর্যাবৃত্ত|পর্যাবৃত্তিক\s*ধর্ম|রাসায়নিক\s*বন্ধন|periodic\s*propert/i },
  { name: 'রাসায়নিক পরিবর্তন', regex: /রাসায়নিক\s*পরিবর্তন|রাসায়নিক\s*পরিবর্তন|chemical\s*change/i },
  { name: 'কর্মমুখী রসায়ন', regex: /কর্মমুখী|applied\s*chem/i },
  { name: 'পরিবেশ রসায়ন', regex: /পরিবেশ\s*রসায়ন|পরিবেশ\s*রসায়ন|environmental\s*chem/i },
  { name: 'জৈব যৌগ', regex: /জৈব\s*যৌগ|জৈব\s*রসায়ন|জৈব\s*রসায়ন|organic\s*chem/i },
  { name: 'পরিমাণগত রসায়ন', regex: /পরিমাণগত|পরিমানগত|quantitative\s*chem/i },
  { name: 'তড়িৎ রসায়ন', regex: /তড়িৎ\s*রসায়ন|তড়িৎ\s*রসায়ন|electrochem/i },
  { name: 'অর্থনৈতিক রসায়ন', regex: /অর্থনৈতিক\s*রসায়ন|industrial\s*chem/i },

  // জীববিজ্ঞান (উদ্ভিদ ও প্রাণী)
  { name: 'কোষ ও এর গঠন', regex: /কোষ\s*ও\s*এর\s*গঠন|cell\s*structure/i },
  { name: 'কোষ বিভাজন', regex: /কোষ\s*বিভাজন|cell\s*division|mitosis|meiosis/i },
  { name: 'কোষ রসায়ন', regex: /কোষ\s*রসায়ন|কার্বোহাইড্রেট|প্রোটিন|লিপিড|এনজাইম/i },
  { name: 'অনুজীব', regex: /অনুজীব|অণুজীব|ভাইরাস|ব্যাকটেরিয়া|microbiology/i },
  { name: 'শৈবাল ও ছত্রাক', regex: /শৈবাল|ছত্রাক|algae|fungi/i },
  { name: 'ব্রায়োফাইটা ও টেরেডোফাইটা', regex: /ব্রায়োফাইটা|টেরেডোফাইটা|bryophyta/i },
  { name: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', regex: /নগ্নবীজী|আবৃতবীজী|gymnosperm|angiosperm/i },
  { name: 'টিস্যু ও টিস্যুতন্ত্র', regex: /টিস্যু\s*ও\s*টিস্যুতন্ত্র|plant\s*tissue/i },
  { name: 'উদ্ভিদ শারীরতত্ত্ব', regex: /উদ্ভিদ\s*শারীরতত্ত্ব|সালোকসংশ্লেষণ|শ্বসন|photosynthesis/i },
  { name: 'উদ্ভিদ প্রজনন', regex: /উদ্ভিদ\s*প্রজনন|reproduction/i },
  { name: 'জীবপ্রযুক্তি', regex: /জীবপ্রযুক্তি|বায়োটেকনোলজি|biotechnology|genetic\s*engineering/i },
  { name: 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', regex: /জীবের\s*পরিবেশ|ইকোলজি|ecology|conservation/i },
  { name: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', regex: /প্রাণীর\s*বিভিন্নতা|শ্রেণিবিন্যাস|শ্রেণীবিন্যাস|animal\s*diversity/i },
  { name: 'প্রাণির পরিচিতি', regex: /হাইড্রা|ঘাসফড়িং|রুই\s*মাছ|প্রাণির\s*পরিচিতি/i },
  { name: 'পরিপাক ও শোষণ', regex: /পরিপাক|শোষণ|digestion/i },
  { name: 'রক্ত ও সংবহন', regex: /রক্ত|সংবহন|হৃদপিণ্ড|circulat/i },
  { name: 'শ্বসন ও শ্বাসক্রিয়া', regex: /শ্বসন|শ্বাসক্রিয়া|respirat/i },
  { name: 'বর্জ্য ও নিষ্কাশন', regex: /বর্জ্য|নিষ্কাশন|বৃক্ক|kidney|excret/i },
  { name: 'চলন ও অঙ্গচালনা', regex: /চলন|অঙ্গচালনা|কঙ্কাল|হাড়|skelet/i },
  { name: 'মানব শারীরতত্ত্ব', regex: /সমন্বয়|নিয়ন্ত্রণ|মস্তিষ্ক|হরমোন|nervous/i },
  { name: 'মানব জীবনের ধারাবাহিকতা', regex: /ধারাবাহিকতা|মানব\s*প্রজনন/i },
  { name: 'মানবদেহের প্রতিরক্ষা', regex: /প্রতিরক্ষা|ইমিউন|রোগ\s*প্রতিরোধ|immune/i },
  { name: 'জিনতত্ত্ব ও বিবর্তন', regex: /জিনতত্ত্ব|বিবর্তন|মেন্ডেল|genetics|evolution/i }
];

export function cleanAndNormalizeChapterTitle(raw: string): string {
  if (!raw) return '';
  const text = raw.trim();

  // ১. সরাসরি একাডেমিক প্যাটার্ন ম্যাচিং (১০০% নিখুঁত)
  for (const item of ACADEMIC_CHAPTER_PATTERNS) {
    if (item.regex.test(text)) {
      return item.name;
    }
  }

  // ২. যদি একাডেমিক না হয়, তখন প্রিফিক্স ও সাফিক্স পরিষ্কার করা
  let s = text
    .replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // সামনে থেকে Class 1:, Lecture 01:, ইত্যাদি সরানো
  s = s
    .replace(/^(?:class|ক্লাস|lecture|লেকচার|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯a-zA-Z]*\s*[:–—\-।.]\s*/i, '')
    .replace(/^[\d০-৯]+[\.\s:–—\-]+\s*/, '')
    .replace(/^(?:physics|chemistry|math|higher math|biology|ict|বাংলা|গণিত|উচ্চতর গণিত|পদার্থ|রসায়ন|ch-?\d+|chapter-?\d+|অধ্যায়-?\s*[\d০-৯]*)\s*[:–—\-]\s*/i, '')
    .trim();

  // পেছন থেকে Lecture 1, Part 1 ইত্যাদি সরানো
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s
      .replace(/\s*[-–—:]\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
      .replace(/\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
      .replace(/\s*[-–—:]\s*[\d০-৯]+.*$/i, '')
      .replace(/\s+[\d০-৯]+(?:\s+(?:part|পার্ট|পর্ব|লেকচার)[\s\d০-৯]+)?.*$/i, '')
      .replace(/\s*(?:part|পার্ট|পর্ব|লেকচার|class|ক্লাস)\s*$/i, '')
      .replace(/\s*[-–—:]\s*$/i, '')
      .replace(/\|.*$/g, '')
      .trim();
  }

  const lower = s.toLowerCase();
  if (CHAPTER_SYNONYMS[lower]) {
    s = CHAPTER_SYNONYMS[lower];
  } else if (CHAPTER_SYNONYMS[s]) {
    s = CHAPTER_SYNONYMS[s];
  }
  return s;
}

export function isGenericChapterTitle(raw: string | null | undefined): boolean {
  if (!raw || !raw.trim()) return true;
  const clean = raw.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (/^(?:অধ্যা[য়য়য][\u09BC]?|chapter|topic|টপিক|module|লেকচার|ক্লাস|পাঠ)\s*[:–—\-#]?\s*[\d০-৯a-z]*$/i.test(clean)) return true;
  if (/^chapter\s*[\d০-৯]+[:\s]*(?:অধ্যা[য়য়য][\u09BC]?\s*[\d০-৯]*)$/i.test(clean)) return true;
  if (/^মূল\s*অধ্যা/i.test(clean)) return true;
  if (/^টপিক\s*[\d০-৯]+/i.test(clean)) return true;
  return false;
}

export function inferChapterTitleFromClasses(classes: any[] | undefined, fallbackOrder: number): string {
  const counts: Record<string, number> = {};
  for (const cl of (classes || [])) {
    const t = cl?.title || cl?.classTitle || cl?.description || '';
    if (!t) continue;
    if (/orientation|tech test|intro/i.test(t) && (classes || []).length > 1) continue;
    const norm = cleanAndNormalizeChapterTitle(t);
    if (norm && norm.length >= 2 && !isGenericChapterTitle(norm)) {
      counts[norm] = (counts[norm] || 0) + 1;
    }
  }

  let best = '';
  let maxCount = 0;
  for (const [name, cnt] of Object.entries(counts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      best = name;
    }
  }

  if (best) return best;
  for (const cl of (classes || [])) {
    const norm = cleanAndNormalizeChapterTitle(cl?.title || cl?.classTitle || cl?.description || '');
    if (norm && norm.length >= 2 && !isGenericChapterTitle(norm)) return norm;
  }
  return `অধ্যায় ${fallbackOrder}`;
}

export function resolveChapterTitle(rawTitle: string | null | undefined, classes: any[] | undefined, order: number): string {
  const isGeneric = isGenericChapterTitle(rawTitle);
  if (!isGeneric && rawTitle && rawTitle.trim()) {
    return rawTitle.trim();
  }
  return inferChapterTitleFromClasses(classes, order);
}

export const SUBJECT_DEFINITIONS = [
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

export function isGenericSubjectTitle(raw: string | null | undefined): boolean {
  if (!raw || !raw.trim()) return true;
  const clean = raw.trim();
  return /^(?:বিষয়|বিষয়|subject)\s*[\d০-৯]*$/i.test(clean);
}

export function inferSubjectTitleFromContent(contentText: string, fallbackTitle: string): string {
  let best: string | null = null;
  let maxScore = 0;

  for (const def of SUBJECT_DEFINITIONS) {
    const matches = contentText.match(def.regex);
    const score = matches ? matches.length : 0;
    if (score > maxScore) {
      maxScore = score;
      best = def.name;
    }
  }

  if (best && maxScore > 0) {
    return best;
  }
  return fallbackTitle;
}

export function inferSubjectTitleFromChapters(chapters: any[] | undefined, fallbackTitle: string): string {
  const allText = (chapters || []).map(ch => {
    const chTitle = ch.title || '';
    const classTitles = (ch.classes || []).map((c: any) => (c.title || '') + ' ' + (c.description || '')).join(' ');
    return chTitle + ' ' + classTitles;
  }).join(' ');

  return inferSubjectTitleFromContent(allText, fallbackTitle);
}

export function resolveSubjectTitle(rawTitle: string | null | undefined, chapters: any[] | undefined, fallbackOrder: number): string {
  if (rawTitle && !isGenericSubjectTitle(rawTitle) && rawTitle.trim().length > 2) {
    return rawTitle.trim();
  }
  return inferSubjectTitleFromChapters(chapters, `বিষয় ${fallbackOrder}`);
}

/**
 * Universal auto-healer for Course object:
 * Modifies course in-place or returns a clean clone with all generic subject and chapter names resolved.
 */
export function healCourse<T = any>(rawCourse: T): T {
  if (!rawCourse || typeof rawCourse !== 'object') return rawCourse;

  const course = { ...(rawCourse as any) };

  // 1. If course has sections & modules (Standard Platform Hierarchy)
  if (Array.isArray(course.sections) && course.sections.length > 0) {
    const sectionMap = new Map<string, any>();
    course.sections.forEach((sec: any) => sectionMap.set(sec.id, sec));

    const modulesBySection: Record<string, any[]> = {};
    (course.modules || []).forEach((mod: any) => {
      const sId = mod.parentSectionId || 'default';
      if (!modulesBySection[sId]) modulesBySection[sId] = [];
      modulesBySection[sId].push(mod);
    });

    course.sections = course.sections.map((sec: any, sIdx: number) => {
      if (sec.type === 'archive' && !sec.parentArchiveId) return sec;

      const mods = modulesBySection[sec.id] || [];
      const contentText = mods.map(m => {
        const mTitle = m.title || '';
        const lTitles = (m.lectures || []).map((l: any) => (l.title || '') + ' ' + (l.description || '')).join(' ');
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

    // Rebuild updated section title lookup
    const updatedSecTitleMap: Record<string, string> = {};
    course.sections.forEach((s: any) => {
      updatedSecTitleMap[s.id] = s.title;
    });

    // Update modules parentSectionTitle and clean generic module titles
    if (Array.isArray(course.modules)) {
      course.modules = course.modules.map((mod: any, mIdx: number) => {
        const updatedSecTitle = mod.parentSectionId ? updatedSecTitleMap[mod.parentSectionId] : null;
        let cleanModTitle = mod.title;
        if (isGenericChapterTitle(cleanModTitle)) {
          cleanModTitle = inferChapterTitleFromClasses(mod.lectures, mIdx + 1);
        }

        return {
          ...mod,
          title: cleanModTitle,
          parentSectionTitle: updatedSecTitle || mod.parentSectionTitle
        };
      });
    }
  }

  // 2. If course has subjects (Scraper / Raw JSON format)
  if (Array.isArray(course.subjects)) {
    course.subjects = course.subjects.map((sub: any, sIdx: number) => {
      const cleanChapters = (sub.chapters || []).map((ch: any, cIdx: number) => {
        let chapTitle = ch.title;
        if (isGenericChapterTitle(chapTitle)) {
          chapTitle = inferChapterTitleFromClasses(ch.classes, cIdx + 1);
        }
        return {
          ...ch,
          title: chapTitle
        };
      });

      let subTitle = sub.title;
      if (isGenericSubjectTitle(subTitle) || !subTitle) {
        subTitle = inferSubjectTitleFromChapters(cleanChapters, `বিষয় ${sIdx + 1}`);
      }

      return {
        ...sub,
        title: subTitle,
        chapters: cleanChapters
      };
    });
  }

  // 3. If course has archive.subjects
  if (course.archive && Array.isArray(course.archive.subjects)) {
    course.archive.subjects = course.archive.subjects.map((sub: any, sIdx: number) => {
      const cleanChapters = (sub.chapters || []).map((ch: any, cIdx: number) => {
        let chapTitle = ch.title;
        if (isGenericChapterTitle(chapTitle)) {
          chapTitle = inferChapterTitleFromClasses(ch.classes, cIdx + 1);
        }
        return {
          ...ch,
          title: chapTitle
        };
      });

      let subTitle = sub.title;
      if (isGenericSubjectTitle(subTitle) || !subTitle) {
        subTitle = inferSubjectTitleFromChapters(cleanChapters, `বিষয় ${sIdx + 1}`);
      }

      return {
        ...sub,
        title: subTitle,
        chapters: cleanChapters
      };
    });
  }

  return course as T;
}
