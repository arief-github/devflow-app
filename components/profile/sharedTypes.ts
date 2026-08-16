// Base — field yang SELALU ada di kedua varian
interface BaseProps {
  clerkId?: string | null;
  _id: string;
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  createdAt: Date;
}

// Varian Question — punya field eksklusif
export interface QuestionCardProps extends BaseProps {
  title: string;
  type: "question"; // ← discriminant: nilai literal, bukan string
  tags: Array<{
    _id: string;
    name: string;
  }>;
  upvotes: string[];
  views: number;
  answers: Array<object>;
}

// Varian Answer — punya field eksklusif yang berbeda
export interface AnswerCardProps extends BaseProps {
  type: "answer"; // ← discriminant
  question: {
    _id: string;
    title: string;
  };
  upvotes: number; // answer upvote = angka, bukan array
}

// Union — gabungkan keduanya
export type ProfileCardQorAProps = QuestionCardProps | AnswerCardProps;
