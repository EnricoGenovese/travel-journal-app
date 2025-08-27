"use client"

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { journalSchema } from "@/app/lib/schema";
import 'react-quill-new/dist/quill.snow.css';
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMoodById, MOODS } from "@/app/lib/moods";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { createJournalEntry } from "@/actions/journal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCollection, getCollections } from "@/actions/collection";
import CollectionForm from "@/components/collection-dialog";



const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const JournalEntryPage = () => {
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

  const {
    loading: actionLoading,
    func: actionFunc,
    data: actionResult,
  } = useFetch(createJournalEntry);

  const {
    loading: collectionsLoading,
    data: collections,
    func: fetchCollections,
  } = useFetch(getCollections);

  const {
    loading: createCollectionLoading,
    data: createdCollection,
    func: createCollectionFunc,
  } = useFetch(createCollection);

  const router = useRouter();

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });

  useEffect(() => {
    fetchCollections()
  }, [])


  useEffect(() => {

    if (actionResult && !actionLoading) {
      console.log("actionresult:", actionResult, "actionLoading:", actionLoading);
      router.push(`/collection/${actionResult.collectionId ? actionResult.collectionId : "unorganized"
        }`
      );
      toast.success(`Entry created successfully`);
    };

  }, [actionResult, actionLoading])

  const moodValue = watch("mood")

  const onSubmit = handleSubmit(async (data) => {
    const mood = getMoodById(data.mood);

    actionFunc({
      ...data,
      moodScore: mood.score,
      moodQuery: mood.pixabayQuery,
    })
  });

  useEffect(() => {
    if (createdCollection) {
      setIsCollectionDialogOpen(false);
      fetchCollections();
      setValue("collectionId", createdCollection.id);
      toast.success(`Collection ${createdCollection.name} created!`);
    }
  }, [createdCollection])

  const handleCreateCollection = async (data) => {
    createCollectionFunc(data)
  }

  const isLoading = actionLoading || collectionsLoading;

  return (
    <div className="py-8">
      <form className="space-y-2 mx-auto" onSubmit={onSubmit}>
        <h1 className="text-5xl md:text-6xl gradient-title">
          Thinking about...
        </h1>
        {isLoading && <BarLoader color="orange" width={"100%"} />
        }
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            disabled={isLoading}
            {...register("title")}
            placeholder="Write your title..."
            className={`py-5 md:text-md ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mood</label>
          <Controller
            name="mood"
            control={control}
            render={(({ field }) => {
              return (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.mood ? "border-red-500" : ""}>
                    <SelectValue placeholder="I was feeling..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MOODS).map((mood) => {
                      return <SelectItem key={mood.id} value={mood.id}>
                        <span className="flex items-center gap-2">
                          {mood.emoji} {mood.label}
                        </span>
                      </SelectItem>
                    })}
                  </SelectContent>
                </Select>
              )
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {getMoodById(moodValue)?.prompt ?? "My thoughts for the day..."}</label>
          <Controller
            name="content"
            control={control}
            render={(({ field }) => (
              <ReactQuill
                readOnly={isLoading}
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "stike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["quote", "code-block"],
                    ["link"],
                    ["clean"]
                  ],
                }}
              />
            ))}

          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Add To Collection (Optional)
          </label>
          <Controller
            name="collectionId"
            control={control}
            render={(({ field }) => {
              return (
                <Select onValueChange={(value) => {
                  if (value === "new") {
                    setIsCollectionDialogOpen(true)
                  } else {
                    field.onChange(value)
                  }
                }} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a collection..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem key="0" value="none" className="text-gray-400">
                      None
                    </SelectItem> */}
                    {collections?.map((collection) => {
                      return (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      )
                    })}
                    <SelectItem value="new">
                      <span className="text-orange-600">
                        + New
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )
            })}
          />

          {errors.collectionId && (
            <p className="text-red-500 text-sm">{errors.collectionId.message}</p>
          )}
        </div>
        <div className="space-y-4 flex">
          <Button
            disabled={actionLoading}
            type="submit"
            variant="journal">
            Publish
          </Button>
        </div>
      </form>
      <CollectionForm
        loading={createCollectionLoading}
        onSuccess={handleCreateCollection}
        open={isCollectionDialogOpen}
        setOpen={setIsCollectionDialogOpen} />
    </div>
  )
}

export default JournalEntryPage;