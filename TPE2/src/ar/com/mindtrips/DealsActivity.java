package ar.com.mindtrips;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;


public class DealsActivity extends Activity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_deals);

		// Get the intent, verify the action and get the query
		Intent intent = getIntent();
		if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
			String query = intent.getStringExtra(SearchManager.QUERY);
			// doMySearch(query);
			RequestReceiver reciver = new RequestReceiver() {

				@Override
				public void onSuccess(JSONObject json) {
					try {
						search(json.getJSONArray("airports").getJSONObject(0).getString("city_id"));
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				public void onError(String msg, int code) {
					Context context = getApplicationContext();
					CharSequence text = getResources().getString(R.string.cityerror);
					int duration = Toast.LENGTH_LONG;

					Toast toast = Toast.makeText(context, text, duration);
					toast.show();
					finish();
				}
				
			};
			QueryIntent newintent = new Get(reciver, "Geo", "GetAirportsByName");
			newintent.put("name", query);
			startService(newintent);
		}
	}
	
	private void search(String city){
		RequestReceiver receiver = new RequestReceiver() {

			@Override
			public void onSuccess(JSONObject json) {
				ListView mlistView = (ListView) findViewById(R.id.dealsList);
				try {
					inflateList(json, mlistView);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			public void onError(String msg, int code) {
				Context context = getApplicationContext();
				CharSequence text = getResources().getString(R.string.cityerror);
				int duration = Toast.LENGTH_LONG;

				Toast toast = Toast.makeText(context, text, duration);
				toast.show();
				finish();
			}
		};
		QueryIntent newintent = new Get(receiver, "Booking", "GetFlightDeals");
		newintent.put("from", city);
		startService(newintent);
	}
	private void inflateList(JSONObject json,ListView list) throws JSONException{
		String currency = json.getString("currencyId");
		JSONArray arr = json.getJSONArray("deals");
		String[] data = new String[arr.length()];
		for(int i = 0; i< arr.length(); i++){
			data[i] = arr.getJSONObject(i).getString("cityName") + " - " + arr.getJSONObject(i).getString("price") +
					" " + currency;
		}
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, 
		        android.R.layout.simple_list_item_1, data);
		list.setAdapter(adapter);
	}
}
