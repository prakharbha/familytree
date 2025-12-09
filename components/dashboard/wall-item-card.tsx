import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface LegacyWallItemProps {
    item: {
        id: string
        title: string
        category: string
        description?: string | null
        lesson?: string | null
        createdAt: Date | string
        mediaItems?: { url: string; type: string }[]
    }
}

export function WallItemCard({ item }: LegacyWallItemProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-serif">{item.title}</CardTitle>
                    <Badge variant="outline" className="uppercase text-xs tracking-wider">
                        {item.category}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Added {formatDate(item.createdAt)}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {item.description && (
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                )}

                {item.lesson && (
                    <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">Life Lesson</h4>
                        <p className="text-sm text-amber-800 italic">"{item.lesson}"</p>
                    </div>
                )}

                {item.mediaItems && item.mediaItems.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {item.mediaItems.map((media, idx) => (
                            <div key={idx} className="relative aspect-video rounded-md overflow-hidden bg-gray-100">
                                {/* Placeholder for actual media rendering - simplistic for now */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                    {media.type}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
