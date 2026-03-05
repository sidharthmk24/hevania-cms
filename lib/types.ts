export type AnswerOption = "A" | "B" | "C" | "D";

export type Topic = {
  id: string;
  title: string;
  heading: string | null;
  description: string | null;
  result_a_text: string;
  result_b_text: string;
  result_c_text: string;
  result_d_text: string;
};

export type Question = {
  id: string;
  topic_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  order: number;
};
