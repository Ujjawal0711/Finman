import { BASE } from '../api';

export default function ExportButtons() {
  return (
    <div className="actions">
      <a className="button" href={`${BASE}/api/export/json`} download>Export JSON</a>
      <a className="button" href={`${BASE}/api/export/csv`} download>Export CSV</a>
    </div>
  );
}
