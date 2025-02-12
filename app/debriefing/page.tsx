"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function DebriefingPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleSubmit = () => {
    if (password === "gingerbread") {
      router.push("/experimenter");
    } else {
      setError("Wrong password");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <p className="text-center text-lg sm:text-xl leading-relaxed">
            That concludes the study. Thanks for participating.
          </p>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-58 h-16 text-xl bg-[#ffeeb2] hover:bg-[#ffe699] text-black" variant="secondary">
                View Debriefing Form Again
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>That concludes the study. Thanks for participating. Please view the debriefing form below. Then give the tablet back to the experimenter.</DialogTitle>
              </DialogHeader>
              <iframe
                src="/old-debriefing-form.pdf"
                title="Debriefing Form PDF"
                className="w-full h-[600px] border-none"
              />
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Input
              placeholder="For experimenter only"
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              className="italic placeholder-gray-500 flex-1"
            />
            <Button onClick={handleSubmit}>Enter</Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

