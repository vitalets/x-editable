<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Serie;

class SerieController extends Controller
{
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $serie = Serie::findOrFail($id);
        $name = $request->get('name');
        $value = $request->get('value');
        $serie->$name = $value;
        return $serie->save();
    }
}
/*
The blade template.
<span class='video-editable' data-emptytext='Click to add YouTube Video' data-type='text' data-url='{{ route('serie/quick_update', $serie->id) }}' data-pk="{{ $serie->id }}" data-name='video'>
    {{ nl2br($serie->video) }}
</span>
*/
