import { useState } from "react";
import { Pencil, Trash2, Loader2, SearchX } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store/store";
import { deleteCategoryService } from "../../../../features/category/delete-category/delete-category.service";
import { listCategoriesAction } from "../../../../features/category/list-categories/list-categories.action";
import { callSnack } from "../../../../components/snackbar";
import CategoryDialog from "../category-dialog";
import type { Category } from "../../../../features/category/category.slice";
import DeleteDialog from "../../../../components/delete-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";

interface ListCategoriesProps {
  categories: Category[];
  total: number;
  hasMore: boolean;
  fetchMoreCategories: () => void;
  searchQuery: string;
}

export default function ListCategories({
  categories,
  total,
  hasMore,
  fetchMoreCategories,
  searchQuery,
}: Readonly<ListCategoriesProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [updateCategory, setUpdateCategory] = useState<Category | null>(null);

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      setDeleteLoading(true);
      await deleteCategoryService(deletingCategory.uuid);
      await dispatch(listCategoriesAction({ page: 1, limit: 10, search: searchQuery.trim() || undefined, })).unwrap();
      callSnack("Category deleted successfully", "success");
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Failed to delete category", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  const handleUpdateClick = (category: Category) => {
    setUpdateCategory(category);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setUpdateCategory(null);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  return (
    <>
      <InfiniteScroll
        dataLength={categories.length}
        next={fetchMoreCategories}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        scrollableTarget="scrollableDiv"
        endMessage={
          categories.length > 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm font-medium">No more categories to load</p>
            </div>
          ) : null
        }
      >
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {categories.map((category) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              key={category.uuid}
              className="group relative overflow-hidden bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Avatar className="h-14 w-14 ring-4 ring-background/50 border border-border/50 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300 relative z-10">
                        <AvatarImage src={category.logo || undefined} alt={category.name} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-foreground text-xl font-bold">{category.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-bold text-lg leading-tight group-hover:text-primary truncate transition-colors duration-300">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground/90 mb-6 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                  {category.description || "No description provided for this category."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40 relative z-10">
                <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {dayjs(category.created_at).format("MMM DD, YYYY")}
                </div>
                <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateClick(category)}
                    disabled={deleteLoading}
                    className="h-8 w-8 bg-background/50 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(category)}
                    disabled={deleteLoading}
                    className="h-8 w-8 bg-background/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </InfiniteScroll>

      {categories.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-3xl p-10 text-center mt-6 flex flex-col items-center justify-center gap-3"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <SearchX className="h-6 w-6 text-primary opacity-60" />
          </div>
          <p className="text-foreground font-medium">No categories found</p>
          <p className="text-sm text-muted-foreground">Try a different search term or create a new category.</p>
        </motion.div>
      )}

      {updateCategory && (
        <CategoryDialog
          open={editOpen}
          onClose={handleCloseEdit}
          mode="update"
          category={updateCategory}
        />
      )}

      {deletingCategory && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleCloseDelete}
          title="Delete Category?"
          itemName={deletingCategory.name}
          isLoading={deleteLoading}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
}