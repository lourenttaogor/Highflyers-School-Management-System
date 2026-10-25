import {LEVELS} from './config';
// Subject list per class, taken from the two curriculum documents supplied by the school:
//  • "The Complete Scheme of Work for Pre-Primary & Primary Schools" — Pre-Nursery to Nursery 3 are NAPPS-aligned; Primary 1–6 are NERDC-aligned
//  • "New curriculum for secondary schools" (NEW NERDC SCHEME) — JSS 1 to SSS 3
// Excluded on the school's instruction: Arabic, French, Igbo, Nigerian-language subjects and trade subjects.
const N='NAPPS-aligned',R='NERDC';
const c=(name,src,extra={})=>({name,src,official:src===R,kind:'core',...extra});
const core=(names,src)=>names.map(n=>c(n,src));
const rel=()=>[c('Christian Religious Studies',R,{kind:'religion',religion:'CRS'}),c('Islamic Studies',R,{kind:'religion',religion:'IRS'})];
const PRE=['Health Habits','Handwriting','Literacy','Numeracy','Pre-Science','Social Habits'];
const NUR=['Literacy (Letter Work)','Literacy (Language Domain)','Numeracy','Basic Science and Technology','Health Habits','Social Habits','Civic Education','Physical and Health Education','Creativity','Personal Development','Songs and Rhymes','Handwriting'];
const P13=[...core(['English Language','Mathematics','Basic Science','Physical and Health Education'],R),...rel(),...core(['Nigerian History','Social and Citizenship Studies','Cultural and Creative Arts'],R)];
const P46=[...core(['English Language','Mathematics','Basic Science and Technology','Physical and Health Education'],R),...rel(),...core(['Nigerian History','Social and Citizenship Studies','Cultural and Creative Arts','Basic Digital Literacy','Prevocational Studies'],R)];
const JSS=[...core(['English Studies','Mathematics','Physical and Health Education'],R),...rel(),...core(['Nigerian History','Social and Citizenship Studies','Cultural and Creative Arts (CCA)','Intermediate Science','Digital Technologies','Business Studies'],R)];
// The document does not mark which SSS subjects are compulsory; the first four are treated as compulsory, the rest are student-selected.
const SSS=[...core(['English Language','General Mathematics','Citizenship and Heritage Studies','Digital Technologies'],R),
 ...['Biology','Chemistry','Physics','Agriculture','Further Mathematics','Foods & Nutrition','Geography','Technical Drawing','Nigerian History','Government','Visual Arts','Literature in English','Catering Craft','Accounting','Commerce','Marketing','Economics'].map(n=>c(n,R,{kind:'elective'})),
 c('Christian Religious Studies',R,{kind:'elective',religion:'CRS'})];
const rng=(a,b,v)=>Object.fromEntries(LEVELS.slice(LEVELS.indexOf(a),LEVELS.indexOf(b)+1).map(l=>[l,v]));
export const PLAN={'Pre-Nursery':core(PRE,N),'Nursery 1':core(PRE,N),'Nursery 2':core(NUR,N),'Nursery 3':core(NUR,N),...rng('Primary 1','Primary 3',P13),...rng('Primary 4','Primary 6',P46),...rng('JSS 1','JSS 3',JSS),...rng('SSS 1','SSS 3',SSS)};
