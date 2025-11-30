import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import type { RecommendOffersOutput } from "@/ai/flows/personalized-offer-recommendations";

type Offer = RecommendOffersOutput[number];

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl">{offer.title}</CardTitle>
                <CardDescription>{offer.bank}</CardDescription>
            </div>
            <div className="flex gap-1">
            {offer.tags.map(tag => (
                <Badge key={tag} variant={tag === "Pre-Approved" ? "default" : "secondary"}>
                {tag === "Best Match" && <Star className="mr-1 h-3 w-3" />}
                {tag}
                </Badge>
            ))}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
                <p className="text-muted-foreground">APR</p>
                <p className="font-semibold text-lg">{offer.rate}%</p>
            </div>
            <div>
                <p className="text-muted-foreground">Annual Fee</p>
                <p className="font-semibold text-lg">₹{offer.annualFee}</p>
            </div>
        </div>
        <p className="text-sm font-medium mb-2">Key Benefits:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
            {offer.keyBenefits.split('.').filter(b => b.trim()).map((benefit, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{benefit.trim()}.</span>
                </li>
            ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Apply Now</Button>
      </CardFooter>
    </Card>
  );
}
