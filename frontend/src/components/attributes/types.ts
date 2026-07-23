export const ATTRIBUTE_CATEGORIES = [
  "Certification",
  "Domain Knowledge",
  "Personal Information",
  "Soft Skills",
  "Technical Skills",
  "Language",
] as const;
export type AttributeCategory = (typeof ATTRIBUTE_CATEGORIES)[number];

export const ATTRIBUTE_TYPES = [
  "string",
  "text",
  "image",
  "numeric",
  "date",
  "period",
  "boolean",
  "one_of_many",
] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

export const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  string: "Text (single line)",
  text: "Text (Markdown)",
  image: "Image",
  numeric: "Number",
  date: "Date",
  period: "Date range",
  boolean: "Checkbox",
  one_of_many: "Dropdown",
};

export interface AttributeDto {
  id: string;
  name: string;
  category: AttributeCategory;
  description: string;
  dataType: AttributeType;
  options: string[] | null;
  isSystem: boolean;
  createdAt: string;
}
