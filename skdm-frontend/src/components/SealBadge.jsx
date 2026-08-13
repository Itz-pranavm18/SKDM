import { college } from "../data/collegeData";

// The signature visual element used across the site: an emblem styled like
// a convocation seal, carrying the founding year — echoes the trust's own
// use of a formal seal/letterhead identity.
export default function SealBadge({ small = false }) {
  return (
    <div className="seal" style={small ? { "--seal-size": "64px" } : undefined}>
      <span>Est.</span>
      <strong>{college.founded}</strong>
      <span>{college.shortName}</span>
    </div>
  );
}
