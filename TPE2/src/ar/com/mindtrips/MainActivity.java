package ar.com.mindtrips;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;

public class MainActivity extends FragmentActivity {
	
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        FlightSelector selector = new FlightSelector();
        FlightData activity = new FlightData();
        getSupportFragmentManager().beginTransaction().add(R.id.flight_data_container, activity).commit();
        getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, selector).commit();
        ProgressBar progress = (ProgressBar) findViewById(R.id.loading);
        progress.setVisibility(View.INVISIBLE);
	}

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

