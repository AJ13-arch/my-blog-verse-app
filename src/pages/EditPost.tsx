import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PostForm } from "@/components/PostForm";
import { Post, PostFormData } from "@/types/blog";
import { toast } from "@/hooks/use-toast";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) return;
        console.log("Fetching post for editing, ID:", id);

        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching post:", error);
          toast({
            title: "Error",
            description: "Failed to load the post",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (user?.id !== data.author_id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own posts",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        console.log("Post loaded for editing:", data);
        setPost(data);
      } catch (error) {
        console.error("Error in fetchPost:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (data: PostFormData) => {
    if (!post || !user) return;

    try {
      setSaving(true);
      console.log("Updating post:", post.id);

      const { error } = await supabase
        .from("posts")
        .update({
          title: data.title,
          content: data.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id)
        .eq("author_id", user.id);

      if (error) {
        console.error("Error updating post:", error);
        toast({
          title: "Error",
          description: "Failed to update post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your post has been updated!",
      });

      navigate(`/posts/${post.id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
        <h2 className="text-2xl font-bold">Post Not Found</h2>
        <p className="text-muted-foreground">
          The post you're trying to edit doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <PostForm
        initialData={post ? { title: post.title, content: post.content } : undefined}
        onSubmit={handleSubmit}
        isLoading={saving}
        buttonText="Update"
      />
    </div>
  );
}
