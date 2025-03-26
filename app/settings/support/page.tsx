import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail, HelpCircle, LucideIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const SupportLinkBox = (props: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}) => (
  <Link
    href={props.href}
    className="flex items-center rounded-lg border p-4 gap-x-4"
  >
    <props.icon className="h-6 w-6" />
    <div>
      <h4 className="font-medium">{props.title}</h4>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </div>
  </Link>
);

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support & Help</h2>
        <p className="text-muted-foreground">
          Get help and contact our support team
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full p-2">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>How can we help?</CardTitle>
              <CardDescription>
                Our support team is here to assist you
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="contact" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="contact" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-6">
              <SupportLinkBox
                icon={Mail}
                title="Email Support"
                description="Get help via email at support@pegna.ai"
                href="mailto:suport@pegna.ai"
              />
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <h4 className="font-medium">
                      How do I upgrade my subscription?
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can upgrade your subscription by going to the
                    Subscription tab in your Settings. Click on "Manage
                    Subscription" and select the plan you'd like to upgrade to.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <h4 className="font-medium">
                      What happens when I reach my usage limit?
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    When you reach your monthly usage limit, you'll still be
                    able to use basic features, but premium model access will be
                    restricted until the next billing cycle. You can upgrade
                    your plan at any time to increase your limits.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <h4 className="font-medium">
                      How do I customize the AI's behavior?
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can customize the AI's behavior in the AI Experience tab
                    in Settings. There you can adjust personality traits,
                    communication style, and add custom instructions.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <h4 className="font-medium">Is my data secure?</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Yes, we take data security seriously. All conversations are
                    encrypted, and we never share your personal information with
                    third parties. You can export or delete your data at any
                    time from the Account tab in Settings.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <h4 className="font-medium">
                      How do I cancel my subscription?
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can cancel your subscription by going to the
                    Subscription tab in Settings and clicking "Manage
                    Subscription." From there, select "Cancel Subscription."
                    Your access will continue until the end of your current
                    billing period.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline">View All FAQs</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
