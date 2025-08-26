"use client"

import dynamic from "next/dynamic";
import React, { useEffect } from "react";
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



const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const JournalEntryPage = () => {

  const {
    loading: actionLoading,
    func: actionFunc,
    data: actionResult,
  } = useFetch(createJournalEntry);

  const router = useRouter();

  const { register, handleSubmit, control, formState: { errors }, getValues, watch } = useForm({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });

  const isLoading = actionLoading;

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
  })

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
          {/* <Controller
            name="collection"
            control={control}
            render={(({ field }) => (
              )}

          /> */}

          {errors.collectionId && (
            <p className="text-red-500 text-sm">{errors.collectionId.message}</p>
          )}
        </div>
        <div className="space-y-4 flex">
          <Button type="submit" variant="journal">
            Publish
          </Button>
        </div>

      </form>
    </div>
  )
}

export default JournalEntryPage;