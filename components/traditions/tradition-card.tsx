import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { BookHeart } from "lucide-react"

interface TraditionProps {
    item: {
        id: string
        name: string
        origin?: string | null
        description?: string | null
        createdAt: Date | string
        mediaItems?: { url: string; type: string }[]
    }
}

export function TraditionCard({ item }: TraditionProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-amber-100 bg-amber-50/30">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BookHeart className="w-5 h-5 text-amber-600" />
                        <CardTitle className="text-xl font-serif text-amber-900">{item.name}</CardTitle>
                    </div>
                    {item.origin && (
                        <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-100">
                            {item.origin}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {item.description && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                )}
            </CardContent>
        </Card>
    )
}
