import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashbaordRecentSales() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent Sales</CardTitle>
        <p className="text-sm text-muted-foreground">
          You made 265 sales this month.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/olivia.png" alt="Olivia Martin" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Olivia Martin</p>
              <p className="text-xs text-muted-foreground">
                olivia.martin@email.com
              </p>
            </div>
          </div>
          <p className="text-sm font-medium">+$1,999.00</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/jackson.png" alt="Jackson Lee" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Jackson Lee</p>
              <p className="text-xs text-muted-foreground">
                jackson.lee@email.com
              </p>
            </div>
          </div>
          <p className="text-sm font-medium">+$39.00</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/isabella.png" alt="Isabella Nguyen" />
              <AvatarFallback>IN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Isabella Nguyen</p>
              <p className="text-xs text-muted-foreground">
                isabella.nguyen@email.com
              </p>
            </div>
          </div>
          <p className="text-sm font-medium">+$299.00</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/william.png" alt="William Kim" />
              <AvatarFallback>WK</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">William Kim</p>
              <p className="text-xs text-muted-foreground">will@email.com</p>
            </div>
          </div>
          <p className="text-sm font-medium">+$99.00</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/sofia.png" alt="Sofia Davis" />
              <AvatarFallback>SD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Sofia Davis</p>
              <p className="text-xs text-muted-foreground">
                sofia.davis@email.com
              </p>
            </div>
          </div>
          <p className="text-sm font-medium">+$39.00</p>
        </div>
      </CardContent>
    </Card>
  );
}
