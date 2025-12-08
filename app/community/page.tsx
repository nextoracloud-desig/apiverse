import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { User } from "lucide-react";

async function createPost(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return;

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const authorId = (session.user as any).id;

    if (!title || !content) return;

    await prisma.post.create({
        data: {
            title,
            content,
            authorId
        }
    });

    revalidatePath("/community");
}

export default async function CommunityPage() {
    const session = await getServerSession(authOptions);
    let posts: any[] = [];
    try {
        posts = await prisma.post.findMany({
            include: {
                author: true,
                _count: {
                    select: { comments: true, likes: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        // posts remains []
    }

    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Community</h1>
                <p className="text-xl text-muted-foreground">
                    Share your discoveries, ask questions, and connect with other developers.
                </p>
            </div>

            {/* Create Post */}
            {session ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Create a Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createPost} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="What's on your mind?" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content" name="content" placeholder="Share details..." required />
                            </div>
                            <Button type="submit">Post</Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-muted/50">
                    <CardContent className="py-8 text-center">
                        <p>Please sign in to post in the community.</p>
                    </CardContent>
                </Card>
            )}

            {/* Post List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={post.author.image || ""} />
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <span className="font-semibold">{post.author.name}</span>
                                    <span className="text-muted-foreground ml-2">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <CardTitle className="text-xl">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground gap-4 border-t pt-4">
                            <span>{post._count.likes} Likes</span>
                            <span>{post._count.comments} Comments</span>
                        </CardFooter>
                    </Card>
                ))}
                {posts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No posts yet. Be the first to share something!
                    </div>
                )}
            </div>
        </div>
    );
}
