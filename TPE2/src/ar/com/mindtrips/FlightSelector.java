package ar.com.mindtrips;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class FlightSelector extends Fragment {
    
	public View onCreateView(LayoutInflater inflater, ViewGroup container, 
            Bundle savedInstanceState) {
            // Inflate the layout for this fragment
		
			RequestReceiver reciver = new RequestReceiver() {
				
				@Override
				public void onStarted() {
					// TODO Auto-generated method stub
					System.out.println(System.currentTimeMillis());
				}
				
				@Override
				public void onSuccess(JSONObject json) {
					try {
						JSONArray arr = json.getJSONArray("airports ");
						for(int i = 0; i<arr.length(); i++){
							System.out.println("a");
							System.out.println(arr.getJSONObject(i).getString("airportId"));
							
						}
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			};
			QueryIntent intent = new Get(reciver,"Geo","GetAirports");
			getActivity().startService(intent);
			System.out.println("test");
			return inflater.inflate(R.layout.fragment_flight_selector, container, false);
        }
	
	private void setAutocomplete(){
		
	}
}
