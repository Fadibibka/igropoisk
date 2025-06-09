import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Loader from "@shared/ui/Loader";
import Routes from "./Routes.tsx";



export default function RouterApp(){
    return <Suspense fallback={<Loader/>}>{useRoutes(Routes)}</Suspense>
}