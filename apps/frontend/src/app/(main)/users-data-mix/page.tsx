import {Suspense} from "react"
import { getUsers } from "./_actions"
import { DisplayData } from "./display-data";
import Logger from "../../../lib/logger";


const logger = new Logger('users-data-client');

export default function Page() {


  const data = getUsers();
  // logger.warn(data);

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense fallback={<p>Loading initial data...</p>}>
        <DisplayData
          dataPromise={data}
        />
      </Suspense>
    </div>
  );
}