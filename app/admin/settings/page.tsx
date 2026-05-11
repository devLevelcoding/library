import prismadb from "@/lib/prismadb";
import SettingsForm from "./components/settings-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const SettingsPage = async () => {

    const setting = await prismadb.setting.findFirst()

    return (
        <div>
            <Heading 
                title="Settings"
                description="Shop main settings here"
            />
            <Separator />
            <SettingsForm setting={setting} />
        </div>
    )

}
 
export default SettingsPage;