package ar.com.mindtrips;

import org.json.JSONObject;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ListView;
import ar.edu.itba.hci2012.api.RequestReceiver;


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

			RequestReceiver receiver = new RequestReceiver() {

				@Override
				public void onSuccess(JSONObject json) {
					ListView mlistView = (ListView) findViewById(R.id.dealsList);

				}
			};
		}

		/*
		 * 
		 * ListView mlistView = (ListView) findViewById(R.id.dealsList);
		 * mlistView.setAdapter(new ArrayAdapter<String>(this,
		 * android.R.layout.simple_list_item_1, new String[] {"Game", "Help",
		 * "Home site"}));
		 * 
		 * mlistView.setOnItemClickListener(new OnItemClickListener() { public
		 * void onItemClick(AdapterView<?> parent, View view, int position, long
		 * id) { // When clicked, show a toast with the TextView text Game,
		 * Help, Home Toast.makeText(getApplicationContext(), ((TextView)
		 * view).getText(), Toast.LENGTH_SHORT).show(); } });
		 */
	}
}
