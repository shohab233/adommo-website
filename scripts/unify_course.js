const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'lib', 'acs_hsc_26_final_revision_batch_frb_26_data.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('"id": "course_acs_c82195b9"', '"id": "course_acs_frb26"');
content = content.replace('"slug": "acs-hsc-26-final-revision-batch-frb-26"', '"slug": "acs-hsc-26-final-revision-batch-frb"');
content = content.replace('"coverImage": "/courses/frb26_banner.png"', '"coverImage": "/courses/frb26_banner.png"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated ID and slug to course_acs_frb26 in acs_hsc_26_final_revision_batch_frb_26_data.ts');
