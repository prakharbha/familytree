import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, FileText, Key, Mail, Clock, UserCheck, File as FileIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface VaultItemCardProps {
    item: {
        id: string
        title: string
        type: string
        description?: string | null
        createdAt: Date | string
        isLocked: boolean
        unlockAt?: Date | string | null
        isTimeLocked?: boolean
        profile?: {
            name: string
        }
    }
}

const TYPE_ICONS: Record<string, any> = {
    LETTER: Mail,
    KEY: Key,
    INSTRUCTION: FileText,
    DOCUMENT: FileText,
    LOCKED_CAPSULE: Lock
}

export function VaultItemCard({ item }: VaultItemCardProps) {
    const Icon = TYPE_ICONS[item.type] || FileIcon

    return (
        <Card className={`hover:shadow-md transition-shadow ${item.isTimeLocked ? 'bg-stone-50 border-stone-200' : 'bg-white'}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${item.isTimeLocked ? 'bg-stone-200' : 'bg-emerald-100'}`}>
                        <Icon className={`w-4 h-4 ${item.isTimeLocked ? 'text-stone-500' : 'text-emerald-600'}`} />
                    </div>
                    <CardTitle className="text-base font-semibold leading-none">
                        {item.title}
                    </CardTitle>
                </div>
                {item.isTimeLocked && (
                    <Badge variant="outline" className="text-xs bg-stone-100 text-stone-600 border-stone-300">
                        <Clock className="w-3 h-3 mr-1" /> Locked
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-sm text-gray-500 line-clamp-3 min-h-[60px]">
                    {item.description || "No description provided."}
                </div>

                {/* Sender Info for Shared/Heir Items */}
                {item.profile && (
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <UserCheck className="w-3 h-3 mr-1" />
                        <span>From: {item.profile.name}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="text-xs text-gray-400 pt-0">
                <div className="flex w-full justify-between items-center">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.isTimeLocked && item.unlockAt && (
                        <span className="text-orange-600 font-medium">
                            Opens: {new Date(item.unlockAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
