import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/blog";
import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6;

  // Fetch posts with pagination and optional search filter
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching posts, page:", currentPage, "search:", searchQuery);
        
        let query = supabase
          .from("posts")
          .select(`
            *,
            profiles!fk_posts_profiles(username)
          `, { count: 'exact' });

        // Apply search filter if there's a query
        if (searchQuery) {
          query = query
            .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Apply pagination
        const from = (currentPage - 1) * postsPerPage;
        const to = from + postsPerPage - 1;

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        console.log("Posts data:", data);
        setPosts(data || []);
        
        // Calculate total pages
        if (count !== null) {
          setTotalPages(Math.ceil(count / postsPerPage));
        }
      } catch (error) {
        console.error("Error in fetchPosts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Vibrant Journal</h1>
        <p className="text-muted-foreground">
          Discover and share your thoughts, stories, and ideas with the world.
        </p>
      </section>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search posts by title or content..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          {searchQuery ? (
            <p className="text-muted-foreground">
              No posts match your search criteria. Try a different search term.
            </p>
          ) : (
            <p className="text-muted-foreground">
              There are no posts yet. Be the first to create one!
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
