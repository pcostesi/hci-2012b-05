package ar.com.mindtrips;

import org.json.JSONObject;

import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.SearchView;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class MainActivity extends FragmentActivity {
	FlightSelector selector;
	FlightData activity;
	ProgressBar progress;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		selector = new FlightSelector();
		activity = new FlightData();
		getSupportFragmentManager().beginTransaction()
				.add(R.id.flight_data_container, activity).commit();
		getSupportFragmentManager().beginTransaction()
				.add(R.id.fragment_container, selector).commit();
		progress = (ProgressBar) findViewById(R.id.loading);
		progress.setVisibility(View.INVISIBLE);

	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.activity_main, menu);
		
	    // Get the SearchView and set the searchable configuration
	    SearchManager searchManager = (SearchManager) getSystemService(Context.SEARCH_SERVICE);
	    SearchView searchView = (SearchView) menu.findItem(R.id.searchbar).getActionView();
	    searchView.setSearchableInfo(searchManager.getSearchableInfo(getComponentName()));
		
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle item selection
		Intent intent;
		switch (item.getItemId()) {
		case R.id.ratings:
			intent = new Intent(this, RatingActivity.class);
			startActivity(intent);
			return true;
		case R.id.flight_status:
			intent = new Intent(this, FlightStatusActivity.class);
			startActivity(intent);
			return true;
		default:
			return super.onOptionsItemSelected(item);
		}
	}

	public void changeData(String airline, Integer flightid) {
		progress.setVisibility(View.VISIBLE);
		RequestReceiver reciver = new RequestReceiver() {

			public void onSuccess(JSONObject json) {
				System.out.println(json.toString());
			}

			public void onError(String msg, int code) {
				System.out.println(msg + " " + code);
			}
		};
		QueryIntent intent = new Get(reciver, "Status", "GetFlightStatus");
		intent.put("airline_id", airline);
		intent.put("flight_num", flightid.toString());
		startService(intent);
	}
}
