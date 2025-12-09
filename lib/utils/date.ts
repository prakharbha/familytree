import { format } from "date-fns"

export function formatDate(date: string | Date | number): string {
    const d = new Date(date)
    return format(d, "MMMM d, yyyy")
}
