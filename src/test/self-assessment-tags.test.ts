import { describe, expect, it } from "vitest";
import { SELF_QUESTIONNAIRES } from "../../supabase/functions/_shared/selfAssessment";
import { selfAssessmentTags } from "../data/selfAssessmentTags";

describe("community concern extraction", () => {
  it("only extracts reported sleep concerns, excluding normal answers", () => {
    expect(selfAssessmentTags(SELF_QUESTIONNAIRES[0], { s1: 3, s2: 0, s3: 0 }).map(x => x.id)).toEqual(["s1"]);
  });
  it("extracts reduced food intake with reverse scoring, without inferring calorie intake", () => {
    expect(selfAssessmentTags(SELF_QUESTIONNAIRES[1], { n1: 0, n2: 3, n3: 2, n4: 1, n5: 2, n6: 3 }).map(x => x.id)).toEqual(["n1"]);
    expect(selfAssessmentTags(SELF_QUESTIONNAIRES[1], { n1: 2 })).toEqual([]);
  });
});