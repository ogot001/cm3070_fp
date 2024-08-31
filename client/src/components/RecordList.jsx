import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Record = ({ record, collectionName }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <Link to={`/${collectionName}/edit/${record._id}`} className="block">
        {record.name}
      </Link>
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <Link to={`/${collectionName}/edit/${record._id}`} className="block">
        {record.position}
      </Link>
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <Link to={`/${collectionName}/edit/${record._id}`} className="block">
        {record.level}
      </Link>
    </td>
  </tr>
);

export default function RecordList({ collectionName }) {
  const [records, setRecords] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  const [searchLevel, setSearchLevel] = useState('');

  // Fetch records from the database
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/${collectionName}/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const records = await response.json();
      setRecords(records);
    }
    getRecords();
  }, [collectionName]);

  // Filter records based on search fields
  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchName.toLowerCase()) &&
    record.position.toLowerCase().includes(searchPosition.toLowerCase()) &&
    record.level.toLowerCase().includes(searchLevel.toLowerCase())
  );

  // Render the filtered records
  function recordList() {
    return filteredRecords.map(record => (
      <Record record={record} key={record._id} collectionName={collectionName} />
    ));
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>
      <div className="p-4">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Search by Position"
              value={searchPosition}
              onChange={(e) => setSearchPosition(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Search by Level"
              value={searchLevel}
              onChange={(e) => setSearchLevel(e.target.value)}
              className="border rounded p-2"
            />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Position
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0">
                {recordList()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
