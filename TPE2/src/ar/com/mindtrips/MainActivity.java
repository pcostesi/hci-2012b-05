package ar.com.mindtrips;

import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
<<<<<<< HEAD
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import ar.edu.itba.hci2012.api.FlightsAPIService;
import ar.edu.itba.hci2012.api.QueryIntent;
import ar.edu.itba.hci2012.api.RequestReceiver;
=======
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
>>>>>>> 983593c8ad2558826ceca57c03194e12e7ca7340

public class MainActivity extends FragmentActivity {

	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
<<<<<<< HEAD
        RequestReceiver receiver = new RequestReceiver() {
			
			public void onStarted() {
				Log.i("API", "Started api request");
			}
			
			public void onData(String data) {
				System.out.println(data);
				Log.i("data", data);
			}

			@Override
			public void onNetworkError(String error) {
				// TODO Auto-generated method stub
				Log.e("network", "NETWORK ERROR!!!!");
			}

			@Override
			public void onSuccess(JSONObject json) {
				// TODO Auto-generated method stub
				
			}

			@Override
			public void onMetadata(String uuid, String time) {
				// TODO Auto-generated method stub
				
			}

			@Override
			public void onError(String msg, int code) {
				// TODO Auto-generated method stub
				
			}
		};
		Log.i("Test", "Starting");
		Intent req = new QueryIntent(receiver, FlightsAPIService.GET, "Misc", "GetCurrencies", null, null);
		startService(req);
		Log.i("Test", "Service called");

    }
=======
        FlightSelector selector = new FlightSelector();
        FlightData activity = new FlightData();
        getSupportFragmentManager().beginTransaction().add(R.id.flight_data_container, activity).commit();
        getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, selector).commit();
        ProgressBar progress = (ProgressBar) findViewById(R.id.loading);
        progress.setVisibility(View.INVISIBLE);
	}
>>>>>>> 983593c8ad2558826ceca57c03194e12e7ca7340

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_main, menu);
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
}

