package ar.com.mindtrips;

import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.EditText;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class FlightSelector extends Fragment {

	private HashMap<String, String> airlines = new HashMap<String, String>();
	private ViewGroup container = null;
	private AutoCompleteTextView airlinename;
	private EditText airlineid;

	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		// Inflate the layout for this fragment
		View view = inflater.inflate(R.layout.fragment_flight_selector, container, false);
		this.container = container;
		RequestReceiver reciver = new RequestReceiver() {

			@Override
			public void onStarted() {
				// TODO Auto-generated method stub
				System.out.println(System.currentTimeMillis());
			}

			@Override
			public void onSuccess(JSONObject json) {
				System.out.println(json.toString());
				try {
					JSONArray arr = json.getJSONArray("airlines");
					for (int i = 0; i < arr.length(); i++) {
						airlines.put(arr.getJSONObject(i).getString("name"),
								arr.getJSONObject(i).getString("airlineId"));
					}
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				String[] data = airlines.keySet().toArray(new String[0]);
				for (String a : data) {
					System.out.println(a);
				}
				setAutocomplete(data);
			}

			public void onError(String msg, int code) {
				System.out.println(msg + " " + code);
			}
		};
		QueryIntent intent = new Get(reciver, "Misc", "GetAirlines");
		getActivity().startService(intent);
		setUpOk(view);
		return view;
	}

	private void setUpOk(View view) {
		airlinename = (AutoCompleteTextView) view.findViewById(
				R.id.airlinename);
		airlineid = (EditText) view.findViewById(R.id.airlineid);
		airlinename.addTextChangedListener(new TextWatcher() {
			public void afterTextChanged(Editable arg0) {
				System.out.println(arg0.toString());
				if (airlines.get(arg0.toString()) != null) {
					checkFinished();
				}
			}

			public void beforeTextChanged(CharSequence arg0, int arg1,
					int arg2, int arg3) {
			}

			public void onTextChanged(CharSequence arg0, int arg1, int arg2,
					int arg3) {
			}

		});
		airlineid.addTextChangedListener(new TextWatcher() {
			public void onTextChanged(CharSequence s, int start, int before,
					int count) {
			}

			public void beforeTextChanged(CharSequence s, int start, int count,
					int after) {
			}

			public void afterTextChanged(Editable s) {
				if (s.toString().length() >= 1) {
					checkFinished();
				}
			}
		});
	}

	private void checkFinished() {
		String airlinei = airlines.get(airlinename.getText().toString());
		String flightnu = airlineid.getText().toString();
		System.out.println("airline: " + airlinei + " num" + flightnu);
		if (flightnu.length() >= 1 && airlinei != null) {
			((MainActivity) getActivity()).changeData(airlinei,flightnu);
		}
	}

	private void setAutocomplete(String[] data) {
		AutoCompleteTextView textView = (AutoCompleteTextView) getView()
				.findViewById(R.id.airlinename);
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(
				container.getContext(), android.R.layout.simple_list_item_1,
				data);
		textView.setAdapter(adapter);

	}

	public void incorrectData() {
		airlineid.setTextColor(Color.RED);
	}
	public void correctData(){
		airlineid.setTextColor(Color.BLACK);
	}
}
