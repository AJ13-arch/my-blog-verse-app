
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Post } from "@/types/blog";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) return;
        
        console.log("Fetching post with ID:", id);
        // Specify the exact relationship using profiles!fk_posts_profiles
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles!fk_posts_profiles(username)
          `)
          .eq("id", id)
          .single();
        
        if (error) {
          console.error("Error fetching post:", error);
          toast({
            title: "Error",
            description: "Failed to load the post",
            variant: "destructive",
          });
          return;
        }
        
        console.log("Fetched post data:", data);
        setPost(data);
      } catch (error) {
        console.error("Error in fetchPost:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      if (!post) return;
      
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the post",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }
  
  const isAuthor = user && post.author_id === user.id;
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });
  
  return (
    <article className="max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to posts
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
          <span>By {post.profiles?.username || "Unknown"}</span>
          <span>{formattedDate}</span>
        </div>
        
        {isAuthor && (
          <div className="flex space-x-2 mb-6">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/posts/edit/${post.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    post from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <div className="prose dark:prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
