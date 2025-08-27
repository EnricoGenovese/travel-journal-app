"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema } from "@/app/lib/schema";
import { BarLoader } from "react-spinners";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const CollectionForm = ({ onSuccess, open, setOpen, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } =
    useForm({
      resolver: zodResolver(collectionSchema),
      defaultValues: {
        name: "",
        description: "",
      },
    });

  const onSubmit = handleSubmit(async (data) => {
    onSuccess(data)
  })


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        {loading && <BarLoader color="orange" width={"100%"} />}

        <form onSubmit={onSubmit} className="space-y-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Input
                disabled={loading}
                {...register("name")}
                placeholder="Collection's name"
                className={`${errors.title ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="border-red-500 text-sm">{errors.name.message}</p>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Textarea
                disabled={loading}
                {...register("description")}
                placeholder="Describe yout collection"
                className={`${errors.title ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="border-red-500 text-sm">{errors.description.message}</p>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="journal"

            >Create Collection</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
};

export default CollectionForm;