// Guests, speakers and judges. Names/designations come from the DRAFT script —
// check them before the event. `photo` is a path under /public (e.g.
// "/media/people/imal.jpg"); without one, a monogram is shown.

export interface Person {
  id: string;
  name: string;
  title: string; // designation
  org?: string;
  photo?: string;
}

const p = (id: string, name: string, title: string, org?: string, photo?: string): Person => ({ id, name, title, org, photo });

export const GUESTS = {
  minister: p("minister", "Prof. Chrishantha Abeysena", "Hon. Minister of Science and Technology"),
  secretary: p("secretary", "Dr. Roshani Dissanayake", "Secretary", "Ministry of Science and Technology"),
  imal: p("imal", "Mr. Imal Kalutotage", "Chairman, NCINGA · Founding Partner, nVentures", "Guest of Honour"),
  shiromi: p("shiromi", "Prof. (Ms.) P. Shiromi Perera", "Director General & Chief Executive Officer", "National Science Foundation"),
  dilani: p("dilani", "Dr. Dilani Wickramaarachchi", "Head, Department of Industrial Management", "University of Kelaniya"),
  amila: p("amila", "Dr. Amila Withanaarachchi", "Senior Treasurer", "Industrial Management Science Students’ Association"),
  harshana: p("harshana", "Mr. Harshana Praveen", "Chief Coordinator", "hackX Jr 9.0"),
  judgeSpeaker: p("judge-speaker", "[Judge Name]", "[Designation]", "On behalf of the judging panel"),
} satisfies Record<string, Person>;

export const JUDGES_HACKX: Person[] = [
  p("kosala", "Mr. Kosala Jayasekara", "Chief Technical Officer", "Fixel Digital & Olee AI"),
  p("sandun", "Eng. Sandun Wijayarathne", "Chief Engineer, Rannara Engineering · Embedded Systems Architect", "Zone 24x7"),
  p("jaseem", "Mr. Mohammed Jaseem", "Associate Manager", "SLASSCOM"),
  p("hackx-judge-4", "[Judge Name]", "[Designation]", "[Organization]"),
];

export const JUDGES_JR: Person[] = [
  p("dinesh", "Dr. Dinesh Asanka", "Senior Lecturer, Department of Industrial Management", "University of Kelaniya"),
  p("hassan", "Mr. Hassan Satheeq", "Associate Software Architect", "DirectFN Sri Lanka"),
  p("sanjeewa", "Mr. Sanjeewa Pathirana", "Founder & CEO", "Nanosoft Global"),
  p("pulani", "Ms. Pulani Ranasinghe", "Founder & CEO", "Loons Lab"),
  p("mahesha", "Dr. Mahesha Nadugala", "[Designation]", "National Science Foundation"),
];

// Placeholder rows for token-of-appreciation lists (fill in later).
export const tba = (n: number, label = "Name"): Person[] =>
  Array.from({ length: n }, (_, i) => p(`tba-${label}-${i}`, `[${label} ${i + 1}]`, "[Designation]"));
