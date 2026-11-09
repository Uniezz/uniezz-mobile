export type Material = {
  subject: string;
  university: string;
  type: string;
  author: string;
  rating: string;
};

export type AddMaterialFormValues = { subject: string; university: string };

export type MaterialTab = "papers" | "reviews" | "professors";
