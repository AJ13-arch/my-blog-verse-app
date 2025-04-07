
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types/blog";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  // Create a text preview by trimming the content
  const previewContent = post.content.length > 150
    ? post.content.substring(0, 150) + "..."
    : post.content;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <Link to={`/posts/${post.id}`}>
          <CardTitle className="text-xl hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-muted-foreground">{previewContent}</p>
      </CardContent>
      <CardFooter className="pt-2 text-sm text-muted-foreground flex justify-between">
        <span>By {post.profiles?.username || "Unknown"}</span>
        <span>{formattedDate}</span>
      </CardFooter>
    </Card>
  );
}
