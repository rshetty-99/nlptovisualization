import FileUpload from "@/components/query-csv/FileUpload";
import USerQuestion from "@/components/query-csv/UserQuestion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function QuerycsvPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">CSV Query App</h1>
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-xl shadow-lg border-2 border-accent/20 backdrop-blur-md bg-white/5 dark:bg-white/10">
            <CardHeader className="border-b border-accent/20">
              <CardTitle className="text-foreground">Upload CSV</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <FileUpload />
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg border-2 border-accent/20 backdrop-blur-md bg-white/5 dark:bg-white/10">
            <CardHeader className="border-b border-accent/20">
              <CardTitle className="text-foreground">Query CSV</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <USerQuestion />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
