import type {
  BusinessType,
  Category,
  FinancialMovement,
  OperationType,
} from "./financial-types";

const operationTypes: OperationType[] = ["income", "outcome"];
const categories: Category[] = [
  "suppliers",
  "sales",
  "operational",
  "administrative",
  "others",
];
const businessTypes: BusinessType[] = ["B2B", "B2C"];

function isFinancialMovement(value: unknown): value is FinancialMovement {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const movement = value as Record<string, unknown>;
  const date = movement.create_date;
  const parsedDate =
    typeof date === "string" ? new Date(`${date}T00:00:00Z`) : null;

  return (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    parsedDate !== null &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date &&
    typeof movement.amount === "number" &&
    Number.isFinite(movement.amount) &&
    operationTypes.includes(movement.operation_type as OperationType) &&
    categories.includes(movement.category as Category) &&
    businessTypes.includes(movement.business_type as BusinessType)
  );
}

export function validateFinancialMovements(
  value: unknown,
): FinancialMovement[] {
  if (!Array.isArray(value) || !value.every(isFinancialMovement)) {
    throw new Error("Invalid financial movements response");
  }

  return value;
}