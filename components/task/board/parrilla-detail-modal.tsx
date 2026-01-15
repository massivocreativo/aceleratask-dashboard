"use client";

import { useState, useRef, useEffect } from "react";
import { useParrillasStore } from "@/store/parrillas-store";
import { Database } from "@/types/supabase";
import { ParrillaAssignment } from "../assignment/parrilla-assignment";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Eraser,
    Save,
    Trash2,
    Send,
    Calendar,
    User as UserIcon,
    MessageSquare,
    UploadCloud,
    Plus,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from 'browser-image-compression';
import { cn } from "@/lib/utils";

export function ParrillaDetailModal() {
    const {
        selectedParrilla,
        isModalOpen,
        closeParrillaModal,
        updateParrillaStatus,
        addComment,
        statuses,
        users,
        addParrillaImage
    } = useParrillasStore();
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState("#ef4444");
    const [newComment, setNewComment] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const { updateParrilla } = useParrillasStore();

    const onDrop = async (acceptedFiles: File[]) => {
        if (!selectedParrilla) return;

        // Process files concurrently
        await Promise.all(acceptedFiles.map(async (file) => {
            try {
                // Compression Options
                const options = {
                    maxSizeMB: 0.5, // 500KB max
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);

                // If compression fails or file grows (rare), use original
                const fileToUpload = compressedFile.size < file.size ? compressedFile : file;

                await addParrillaImage(selectedParrilla.id, fileToUpload);
            } catch (error) {
                console.error("Compression error:", error);
                // Fallback to original
                await addParrillaImage(selectedParrilla.id, file);
            }
        }));
    };

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 6,
        noClick: true // We will handle click manually on specific elements
    });

    useEffect(() => {
        if (selectedParrilla) {
            setEditTitle(selectedParrilla.title);
            setEditDescription(selectedParrilla.description || "");
        }
    }, [selectedParrilla]);

    const handleSaveEdit = async () => {
        if (!selectedParrilla) return;

        await updateParrilla(selectedParrilla.id, {
            title: editTitle,
            description: editDescription
        });
        setIsEditing(false);
    };

    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#000000"];

    useEffect(() => {
        if (selectedImageIndex !== null && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = 4;
                ctx.strokeStyle = drawColor;
                contextRef.current = ctx;
            }
        }
    }, [selectedImageIndex, drawColor]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingMode || !contextRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Scale the mouse coordinates to match valid canvas internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isDrawingMode || !contextRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Scale the mouse coordinates to match valid canvas internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (contextRef.current) {
            contextRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    async function handleAddComment() {
        if (!selectedParrilla || !newComment.trim()) return;

        let attachmentFile: File | undefined;

        // If there is an active drawing (or just in drawing mode with content), merge it
        if (selectedImageIndex !== null && canvasRef.current && isDrawingMode) {
            try {
                // 1. Load the original image to get its natural dimensions
                const originalImage = new Image();
                originalImage.crossOrigin = "anonymous";
                originalImage.src = selectedParrilla.images[selectedImageIndex].url;

                await new Promise((resolve) => {
                    originalImage.onload = resolve;
                    originalImage.onerror = resolve; // Continue even if load fails
                });

                // 2. Create a temporary canvas for merging
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = originalImage.naturalWidth || 800; // Fallback
                tempCanvas.height = originalImage.naturalHeight || 800;
                const ctx = tempCanvas.getContext("2d");

                if (ctx) {
                    // 3. Draw original image
                    ctx.drawImage(originalImage, 0, 0);

                    // 4. Draw annotations on top (scaling correctly)
                    const drawingCanvas = canvasRef.current;
                    ctx.drawImage(
                        drawingCanvas,
                        0, 0, drawingCanvas.width, drawingCanvas.height, // Source
                        0, 0, tempCanvas.width, tempCanvas.height // Destination (match temp canvas size)
                    );

                    // 5. Convert to Blob/File
                    const blob = await new Promise<Blob | null>(resolve =>
                        tempCanvas.toBlob(resolve, 'image/jpeg', 0.8)
                    );

                    if (blob) {
                        attachmentFile = new File([blob], "annotated-image.jpg", { type: "image/jpeg" });
                    }
                }
            } catch (error) {
                console.error("Error merging image:", error);
            }
        }

        // Fix type error or ensure store updated
        await addComment(selectedParrilla.id, newComment, attachmentFile);
        setNewComment("");

        // Reset drawing mode if it was active
        if (isDrawingMode) {
            setIsDrawingMode(false);
            // clearCanvas(); // Optional: keep or clear
        }
    };

    if (!selectedParrilla) return null;

    return (
        <Sheet open={isModalOpen} onOpenChange={() => closeParrillaModal()}>
            <SheetContent className="sm:max-w-4xl w-full p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <SheetHeader className="p-4 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                                    style={{ backgroundColor: selectedParrilla.client.color }}
                                >
                                    {selectedParrilla.client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <SheetTitle className="text-left w-full">
                                        {isEditing ? (
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="font-bold text-lg h-8 px-2"
                                            />
                                        ) : (
                                            selectedParrilla.title
                                        )}
                                    </SheetTitle>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedParrilla.client.name}
                                    </div>
                                    <div className="sr-only">
                                        <SheetDescription>
                                            Detalles de la parrilla {selectedParrilla.title}
                                        </SheetDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mr-10">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                                            <Save className="size-5 text-green-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                            <X className="size-5 text-red-600" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                        <Pencil className="size-5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4">
                        {/* Status & Info Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Estado:</span>
                                <div className="flex gap-1">
                                    {statuses.map((status) => (
                                        <Button
                                            key={status.id}
                                            variant={selectedParrilla.status_id === status.id ? "default" : "outline"}
                                            size="sm"
                                            className="h-7 text-xs"
                                            style={selectedParrilla.status_id === status.id ? { backgroundColor: status.color } : {}}
                                            onClick={() => updateParrillaStatus(selectedParrilla.id, status.id)}
                                        >
                                            {status.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {selectedParrilla.due_date && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="size-4" />
                                    <span>Entrega: {new Date(selectedParrilla.due_date).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                className="w-full min-h-[100px] p-3 text-sm bg-background border border-input rounded-md ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{selectedParrilla.description}</p>
                        )}

                        {/* Assignees */}
                        <div className="flex items-center gap-2 mb-4">
                            <UserIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Asignados:</span>
                            <div className="flex -space-x-1">
                                {selectedParrilla.assignees.map((user) => (
                                    <Avatar key={user.id} className="size-7 border-2 border-background">
                                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                        <AvatarFallback className="text-xs">
                                            {user.full_name.split(" ").map((n: string) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <ParrillaAssignment
                                assignedUsers={selectedParrilla.assignees}
                                allUsers={users}
                                onAssignmentChange={(userIds: string[]) => {
                                    const { updateAssignees } = useParrillasStore.getState();
                                    updateAssignees(selectedParrilla.id, userIds);
                                }}
                                trigger={
                                    <Button variant="outline" size="sm" className="ml-auto">
                                        Editar
                                    </Button>
                                }
                            />
                        </div>

                        {/* Labels */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {selectedParrilla.labels.map((label) => (
                                <Badge key={label.id} variant="secondary" className={cn("text-xs", label.color)}>
                                    {label.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Images Grid */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                Imágenes de la Parrilla
                                <span className="text-muted-foreground font-normal">({selectedParrilla.images.length}/6)</span>
                            </h4>


                            {/* Hidden Input for Dropzone (Always Rendered) */}
                            <input {...getInputProps()} />

                            {selectedParrilla.images.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {selectedParrilla.images.map((image, idx) => (
                                        <div
                                            key={image.id}
                                            className={cn(
                                                "aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative group",
                                                selectedImageIndex === idx
                                                    ? "border-primary ring-2 ring-primary/30"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                            onClick={() => setSelectedImageIndex(idx)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Post ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                                                    Post {idx + 1}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
                                                        const { deleteParrillaImage } = useParrillasStore.getState();
                                                        deleteParrillaImage(selectedParrilla.id, image.id, image.url);
                                                    }
                                                }}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add Image Button in Grid */}
                                    <div
                                        onClick={openFileDialog}
                                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all"
                                    >
                                        <Plus className="size-6 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground font-medium">Añadir</span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    onClick={openFileDialog}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3",
                                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                                        <UploadCloud className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {isDragActive ? "¡Suelta los archivos aquí!" : "Haz clic o arrastra imágenes"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG o WEBP hasta 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Annotator */}
                        {selectedImageIndex !== null && selectedParrilla.images[selectedImageIndex] && (
                            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold">
                                        Anotar Post {selectedImageIndex + 1}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedImageIndex + 1} / {selectedParrilla.images.length}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => setSelectedImageIndex(Math.min(selectedParrilla.images.length - 1, selectedImageIndex + 1))}
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => setSelectedImageIndex(null)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Canvas with image */}
                                <div className="relative aspect-[4/5] max-h-[400px] mx-auto mb-3 rounded-lg overflow-hidden border">
                                    <img
                                        src={selectedParrilla.images[selectedImageIndex].url}
                                        alt={`Post ${selectedImageIndex + 1}`}
                                        className="w-full h-full object-contain bg-black"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={500}
                                        className={cn(
                                            "absolute inset-0 w-full h-full",
                                            isDrawingMode ? "cursor-crosshair" : "pointer-events-none"
                                        )}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </div>

                                {/* Drawing Tools */}
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant={isDrawingMode ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsDrawingMode(!isDrawingMode)}
                                        className="gap-2"
                                    >
                                        <Pencil className="size-4" />
                                        {isDrawingMode ? "Dibujando" : "Dibujar"}
                                    </Button>

                                    {isDrawingMode && (
                                        <>
                                            <div className="flex items-center gap-1">
                                                {colors.map((color) => (
                                                    <button
                                                        key={color}
                                                        className={cn(
                                                            "size-6 rounded-full border-2 transition-all",
                                                            drawColor === color ? "border-foreground scale-110" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setDrawColor(color)}
                                                    />
                                                ))}
                                            </div>

                                            <Button variant="outline" size="sm" onClick={clearCanvas} className="gap-2">
                                                <Eraser className="size-4" />
                                                Limpiar
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Comment Input for Annotation */}
                                <div className="flex gap-2 mt-4 border-t pt-3">
                                    <Input
                                        placeholder={`Comentar sobre Post ${selectedImageIndex + 1}...`}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={handleAddComment} disabled={!newComment.trim()}>
                                        <Send className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <MessageSquare className="size-4" />
                                Comentarios ({selectedParrilla.comments.length})
                            </h4>

                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {selectedParrilla.comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No hay comentarios aún
                                    </p>
                                ) : (
                                    selectedParrilla.comments.map((comment) => {
                                        const user = comment.user;
                                        return (
                                            <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name} />
                                                    <AvatarFallback className="text-xs">
                                                        {user?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium">{user?.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(comment.created_at).toLocaleString('es-ES')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm border-l-2 border-primary/20 pl-2 mb-2">{comment.content}</p>

                                                    {/* Display Attachment if exists */}
                                                    {(comment as any).attachment_url && (
                                                        <div className="mt-2">
                                                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                                <Pencil className="size-3" /> Edición adjunta:
                                                            </div>
                                                            <img
                                                                src={(comment as any).attachment_url}
                                                                alt="Edición adjunta"
                                                                className="rounded-md border max-h-40 object-contain hover:max-h-[500px] transition-all cursor-pointer bg-black/5"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add Comment */}
                            {selectedImageIndex === null && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Escribe un comentario..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                                        <Send className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}









