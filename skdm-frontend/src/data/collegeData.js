// Central content store. Real facts (name, founder, location, affiliation, history)
// are taken from the college's public site. Numbers, staff, notices, gallery
// captions, and testimonials are placeholder/dummy data marked for the client
// to replace with real records.

export const college = {
  shortName: "SKM",
  name: "Shiv Kumari Mahavidyalaya",
  motto: "सा विद्या या विमुक्तये",
  mottoTranslation: "That is true knowledge which liberates.",
  affiliation: "Dr. Ram Manohar Lohia Avadh University",
  trust: "Shiv Kumari Dubey Seva Pratisthan (SKDSP)",
  founded: 2008,
  village: "Ashapur",
  tehsil: "Raniganj",
  district: "Pratapgarh",
  state: "Uttar Pradesh",
  addressLine: "Ashapur Village, Raniganj Tehsil, Pratapgarh District, Uttar Pradesh, India",
  phone: "+91 98XXX XXXXX",
  altPhone: "+91 97XXX XXXXX",
  email: "info@skmahavidyalaya.ac.in",
  admissionsEmail: "admissions@skmahavidyalaya.ac.in",
};

export const stats = [
  { label: "Years of Service", value: new Date().getFullYear() - college.founded, suffix: "+" },
  { label: "Students Enrolled", value: 2400, suffix: "+" },
  { label: "Faculty Members", value: 65, suffix: "+" },
  { label: "Degree Programmes", value: 9, suffix: "" },
];

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Facilities", to: "/facilities" },
  { label: "Faculty", to: "/faculty" },
  { label: "Admissions", to: "/admissions" },
  { label: "Gallery", to: "/gallery" },
  { label: "Notices", to: "/notices" },
  { label: "Contact", to: "/contact" },
];

export const founder = {
  name: "Pandit Ramdeo Dubey Ji",
  title: "Founder Chairman",
  image: "/founder.jpg",
  photoInitials: "RD",
  message: `My heartfelt thanks for being on board the ship of knowledge that promises to steer you through the choppy waters, in pursuit of knowledge and a brilliant career, quite smoothly. The first decades of this century have already unveiled greater opportunities for trained professionals. How well one can take advantage of these opportunities depends a lot on where one is trained and what one has learnt. The close links of the college with industry, reputed academic centres and research organisations give it an insight into what is expected in the coming years, and make its faculty and staff strive consistently for the felt-need changes — adopting a realistic, innovative approach to imparting knowledge in tune with changing socio-economic trends and the rising demands of the educational and entrepreneurial sector.`,
  messageClose: `You are heartily welcome to select one of the educational programmes of SKM — certainly your first solid step on the road to a rewarding career in this era of globalisation and entrepreneurship. I wish you every success in your pursuit of knowledge and your career goals.`,
  bio: `The late Professor Ram Dev Dubey — visionary, educationist, scholarly professor and former legislator — founded Shiv Kumari Mahavidyalaya in 2008 at Ashapur village, Raniganj tehsil, to serve the higher-education needs of the socially left-behind and rural poor of Pratapgarh district. The college is named in memory of his wife, the late Shiv Kumari Dubey, a devoted social worker and political leader. In her memory, the Shiv Kumari Dubey Seva Pratisthan (SKDSP) was registered as a not-for-profit educational trust, which today runs several institutions across the district.`,
};

export const aboutMilestones = [
  { year: "2008", text: "SKM founded at Ashapur village by Professor Ram Dev Dubey to serve rural Pratapgarh." },
  { year: "2009", text: "College affiliated to Dr. Ram Manohar Lohia Avadh University, Ayodhya." },
  { year: "2012", text: "Science and Commerce faculties added alongside the founding Arts programme. (dummy)" },
  { year: "2016", text: "New library block and computer laboratory inaugurated. (dummy)" },
  { year: "2021", text: "Crossed 2,000 cumulative alumni across all programmes. (dummy)" },
  { year: `${new Date().getFullYear()}`, text: "Continuing SKDSP's mission across half-a-dozen institutions in the district." },
];

export const mission = [
  {
    title: "Mission",
    text: "To channel the talent and energy of rural youth by equipping them with the tools of modern education, and to make quality higher education accessible to the socially and economically left-behind communities around Pratapgarh.",
  },
  {
    title: "Vision",
    text: "To be a trusted centre of learning in eastern Uttar Pradesh where every student — regardless of background — gains the knowledge, skills and confidence to build a dignified livelihood.",
  },
  {
    title: "Values",
    text: "Egalitarianism, entrepreneurship and creativity — imparted with the realistic, innovative approach the founder envisioned for a changing social and economic landscape.",
  },
];

export const courses = [
  {
    code: "BA",
    name: "Bachelor of Arts",
    duration: "3 Years",
    eligibility: "10+2 in any stream",
    seats: 240,
    subjects: ["Hindi", "History", "Political Science", "Sociology", "Home Science"],
  },
  {
    code: "BSC",
    name: "Bachelor of Science",
    duration: "3 Years",
    eligibility: "10+2 with Science",
    seats: 120,
    subjects: ["Physics", "Chemistry", "Mathematics", "Zoology", "Botany"],
  },
  {
    code: "BCOM",
    name: "Bachelor of Commerce",
    duration: "3 Years",
    eligibility: "10+2 in any stream",
    seats: 160,
    subjects: ["Accountancy", "Business Studies", "Economics", "Taxation"],
  },
  {
    code: "BCA",
    name: "Bachelor of Computer Applications",
    duration: "3 Years",
    eligibility: "10+2 with Mathematics",
    seats: 60,
    subjects: ["Programming", "Data Structures", "DBMS", "Web Technology"],
  },
  {
    code: "BED",
    name: "Bachelor of Education (B.Ed.)",
    duration: "2 Years",
    eligibility: "Graduation with 50%",
    seats: 100,
    subjects: ["Pedagogy", "Educational Psychology", "Teaching Methods"],
  },
  {
    code: "MA-HINDI",
    name: "M.A. Hindi",
    duration: "2 Years",
    eligibility: "B.A. with Hindi",
    seats: 60,
    subjects: ["Medieval Poetry", "Modern Prose", "Linguistics"],
  },
  // All figures above are placeholder/dummy — replace with verified data.
];

export const facilities = [
  { icon: "library", title: "Central Library", text: "25,000+ volumes, reference section and reading hall seating 150 students. (dummy)" },
  { icon: "lab", title: "Science Laboratories", text: "Dedicated Physics, Chemistry, Botany and Zoology labs with modern instrumentation. (dummy)" },
  { icon: "computer", title: "Computer Lab", text: "60-seat lab with broadband connectivity for BCA and general computing courses. (dummy)" },
  { icon: "sports", title: "Sports Ground", text: "Full-size playground for kabaddi, volleyball, cricket and athletics practice. (dummy)" },
  { icon: "hostel", title: "Girls' Hostel", text: "Supervised residential facility with mess and common study room. (dummy)" },
  { icon: "bus", title: "Transport", text: "Bus routes covering nearby villages across Pratapgarh, Jaunpur and Allahabad borders. (dummy)" },
  { icon: "wifi", title: "Wi-Fi Campus", text: "Campus-wide connectivity to support digital classrooms and e-resources. (dummy)" },
  { icon: "health", title: "Health Room", text: "First-aid and basic medical support on campus during college hours. (dummy)" },
];

export const departments = ["All", "Arts", "Science", "Commerce", "Computer Science", "Education"];

export const faculty = [
  { name: "Dr. Ashok Tiwari", role: "Principal & Associate Professor, Hindi", dept: "Arts", initials: "AT" },
  { name: "Dr. Meera Srivastava", role: "Head, Department of Science", dept: "Science", initials: "MS" },
  { name: "Prof. Rakesh Pandey", role: "Head, Department of Commerce", dept: "Commerce", initials: "RP" },
  { name: "Ms. Kavita Singh", role: "Assistant Professor, Computer Applications", dept: "Computer Science", initials: "KS" },
  { name: "Dr. Suresh Yadav", role: "Head, Department of Education", dept: "Education", initials: "SY" },
  { name: "Mr. Vinod Mishra", role: "Assistant Professor, Political Science", dept: "Arts", initials: "VM" },
  { name: "Dr. Poonam Chaturvedi", role: "Assistant Professor, Botany", dept: "Science", initials: "PC" },
  { name: "Mr. Anil Kumar Dubey", role: "Assistant Professor, Economics", dept: "Commerce", initials: "AD" },
  // Faculty list is placeholder/dummy — replace with verified staff records.
];

export const notices = [
  { date: "2026-07-20", tag: "Admission", title: "UG admission form (Session 2026–27) submission window extended to Aug 10. (dummy)" },
  { date: "2026-07-12", tag: "Exam", title: "Odd-semester examination date-sheet released for all faculties. (dummy)" },
  { date: "2026-06-28", tag: "Scholarship", title: "Applications open for state post-matric scholarship — last date Aug 05. (dummy)" },
  { date: "2026-06-15", tag: "Event", title: "Annual Founder's Day function scheduled for 2 Aug 2026 in the main auditorium. (dummy)" },
  { date: "2026-06-01", tag: "Notice", title: "Revised college timings for the monsoon session, effective immediately. (dummy)" },
];

export const admissionSteps = [
  { step: "01", title: "Check Eligibility", text: "Review the qualifying marks and subject requirements for your chosen programme." },
  { step: "02", title: "Fill Online Form", text: "Submit the admission form along with scanned mark-sheets and ID proof." },
  { step: "03", title: "Merit List", text: "Provisional merit lists are published on the notice board and this website." },
  { step: "04", title: "Fee Deposit", text: "Confirm your seat by depositing the admission fee within the given window." },
  { step: "05", title: "Document Verification", text: "Visit the campus with original documents for final verification." },
];

export const feeStructure = [
  { programme: "B.A.", tuition: "₹4,500 / yr", other: "₹1,200 / yr" },
  { programme: "B.Sc.", tuition: "₹7,800 / yr", other: "₹2,400 / yr" },
  { programme: "B.Com.", tuition: "₹5,200 / yr", other: "₹1,200 / yr" },
  { programme: "BCA", tuition: "₹12,000 / yr", other: "₹2,000 / yr" },
  { programme: "B.Ed.", tuition: "₹15,000 / yr", other: "₹2,500 / yr" },
  // Fee figures are placeholder/dummy — replace with the current fee notification.
];

export const testimonials = [
  { name: "Anjali Verma", batch: "B.A. 2022 Batch", quote: "SKM gave me the confidence to speak up in a classroom for the first time in my life. (dummy)" },
  { name: "Sandeep Kumar", batch: "BCA 2021 Batch", quote: "The computer lab and faculty support helped me land my first job in Lucknow. (dummy)" },
  { name: "Rekha Pandey", batch: "B.Ed. 2020 Batch", quote: "I now teach at a government school in my own village — SKM made that possible. (dummy)" },
];

export const galleryItems = [
  { caption: "Main Campus Building", tag: "Campus" },
  { caption: "Founder's Day Celebration", tag: "Events" },
  { caption: "Annual Sports Meet", tag: "Sports" },
  { caption: "Science Laboratory Session", tag: "Academics" },
  { caption: "Central Library Reading Hall", tag: "Campus" },
  { caption: "Independence Day Function", tag: "Events" },
  { caption: "NSS Community Camp", tag: "Community" },
  { caption: "Graduation Convocation", tag: "Events" },
  // Gallery captions are placeholder/dummy — replace with real campus photographs.
];
