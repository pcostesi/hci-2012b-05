package ar.com.mindtrips;

import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import ar.edu.itba.hci2012.api.FlightsAPIService;
import ar.edu.itba.hci2012.api.QueryIntent;
import ar.edu.itba.hci2012.api.RequestReceiver;

public class MainActivity extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
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

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }

    
}
