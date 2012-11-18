package ar.com.mindtrips;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.SearchView;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Get;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class MainActivity extends FragmentActivity {
	FlightSelector selector;
	FlightData activity;
	ProgressBar progress;
	Button review;
	Button flight;
	String airline;
	String flightId;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		selector = new FlightSelector();
		activity = new FlightData();
		getSupportFragmentManager().beginTransaction()
				.add(R.id.fragment_container, selector).commit();
		getSupportFragmentManager().beginTransaction()
				.add(R.id.flight_data_container, activity).commit();
		progress = (ProgressBar) findViewById(R.id.loading);
		progress.setVisibility(View.INVISIBLE);
		review = (Button) findViewById(R.id.review);
		flight = (Button) findViewById(R.id.flight);
		review.setVisibility(View.INVISIBLE);
		flight.setVisibility(View.INVISIBLE);
		setOnClick();
	}

	public void setOnClick() {
		review.setOnClickListener(new OnClickListener() {
			public void onClick(View arg0) {
				startRatings();
			}
		});
		flight.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				setAlerts();
			}
		});
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

	private void startRatings() {
		Intent intent = new Intent(this, RatingActivity.class);
		intent.putExtra("airline", this.airline);
		intent.putExtra("flightId", this.flightId);
		startActivity(intent);
	}

	private void setAlerts() {

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


	public void changeData(final String airline, final Integer flightid) {
		progress.setVisibility(View.VISIBLE);
		RequestReceiver reciver = new RequestReceiver() {

			public void onSuccess(JSONObject json) {
				setCorrectData(airline, flightid.toString());
				progress.setVisibility(View.INVISIBLE);
				activity.clearRows();
				review.setVisibility(View.VISIBLE);
				flight.setVisibility(View.VISIBLE);
				selector.correctData();
				try {
					activity.setUpData(json);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}

			public void onError(String msg, int code) {
				selector.incorrectData();
				progress.setVisibility(View.INVISIBLE);
			}
		};
		QueryIntent intent = new Get(reciver, "Status", "GetFlightStatus");
		intent.put("airline_id", airline);
		intent.put("flight_num", flightid.toString());
		startService(intent);
	}
	private void setCorrectData(String airline, String flightId){
		this.airline = airline;
		this.flightId = flightId;
		
	}
}
