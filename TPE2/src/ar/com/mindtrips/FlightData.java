package ar.com.mindtrips;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TableRow.LayoutParams;
import android.widget.TextView;

public class FlightData extends Fragment {
	private View view;

	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		// Inflate the layout for this fragment
		this.view = inflater.inflate(R.layout.fragment_flight_data, container,
				false);
		return view;
	}

	public void setUpData(JSONObject data) throws JSONException {
		TableLayout table = (TableLayout) view
				.findViewById(R.id.flight_data_table);
		data = data.getJSONObject("status");
		putRow("status", setStatus(data.getString("status")), table);
		putRow("departure", "", table);
		addRows(data.getJSONObject("departure"), table);
		putRow("", "", table);
		putRow("arrival", "", table);
		addRows(data.getJSONObject("arrival"), table);
		putRow("baggageGate",data.getJSONObject("arrival").getJSONObject("airport").getString("baggageGate"),table);
	}

	private String setStatus(String status) {
		String stat;
		switch (status.toCharArray()[0]) {
		case 'S':
			stat = getResources().getString(R.string.planificated);
			break;
		case 'A':
			stat = getResources().getString(R.string.active);
			break;
		case 'D':
			stat = getResources().getString(R.string.deflected);
			break;
		case 'C':
			stat = getResources().getString(R.string.canceled);
			break;
		default:
			stat = "";
		}
		return stat;
	}

	private void addRows(JSONObject json, TableLayout table)
			throws JSONException {
		JSONObject airport = json.getJSONObject("airport");
		putRow("airport", airport.getString("description"), table);
		putRow("terminal", airport.getString("terminal"), table);
		putRow("gate", airport.getString("gate"), table);
		putRow("scheduledTime", json.getString("scheduledTime"), table);
		putRow("actualGateTime", json.getString("actualGateTime"), table);

	}

	private void putRow(String id, String data, TableLayout table) {
		Activity local = (MainActivity) getActivity();
		if (data != "null") {
			TableRow row = new TableRow(local);
			TextView t = new TextView(local);
			TextView d = new TextView(local);
			if(id == "airport"){
				t.setText(getResources().getString(R.string.airport));
			}else if(id == "terminal"){
				t.setText(getResources().getString(R.string.termina));
			}else if(id == "gate"){
				t.setText(getResources().getString(R.string.gate));
			}else if(id == "scheduledTime"){
				t.setText(getResources().getString(R.string.gatetime));
			}else if(id == "actualGateTime"){
				t.setText(getResources().getString(R.string.expgatetime));
			}else if(id == "status"){
				t.setText(getResources().getString(R.string.status));
			}else if(id == "departure"){
				t.setText(getResources().getString(R.string.departure));
			}else if(id == "arrival"){
				t.setText(getResources().getString(R.string.arrival));
			}else if(id == "baggageGate"){
				t.setText(getResources().getString(R.string.baggage));
			}
			d.setText(data);
			row.addView(t);
			row.addView(d);
			table.addView(row, new TableLayout.LayoutParams(
					LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));

		}
	}

	public void clearRows() {
		TableLayout table = (TableLayout) view
				.findViewById(R.id.flight_data_table);
		table.removeAllViews();
	}
}
